import { Injectable } from '@nestjs/common';
import type { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Orders that actually mean money changed hands — pending/cancelled don't count as revenue. */
const PAID_STATUSES: OrderStatus[] = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
const LOW_STOCK_THRESHOLD = 5;
const TOP_PRODUCTS_LIMIT = 5;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [revenueAgg, totalOrders, customerCount, lowStock, topItems] = await Promise.all([
      this.prisma.order.aggregate({
        where: { status: { in: PAID_STATUSES } },
        _sum: { total: true },
      }),
      this.prisma.order.count(),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.product.findMany({
        where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
        orderBy: { stock: 'asc' },
        take: 10,
        select: { id: true, name: true, slug: true, brand: true, stock: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { status: { in: PAID_STATUSES } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: TOP_PRODUCTS_LIMIT,
      }),
    ]);

    const productIds = topItems.map((item) => item.productId).filter((id): id is string => Boolean(id));
    const products = productIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, slug: true, priceMillimes: true },
        })
      : [];
    const productMap = new Map(products.map((product) => [product.id, product]));

    const topProducts = topItems
      .map((item) => {
        const product = item.productId ? productMap.get(item.productId) : undefined;
        return product ? { ...product, unitsSold: item._sum?.quantity ?? 0 } : null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    return {
      revenueMillimes: revenueAgg._sum?.total ?? 0,
      totalOrders,
      customerCount,
      lowStock,
      topProducts,
    };
  }
}
