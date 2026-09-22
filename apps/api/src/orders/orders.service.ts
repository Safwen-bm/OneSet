import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { calculateTotals, clampQuantity, type CartDiscount, type CartLine } from '@oneset/types';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService,
  ) {}

  private reference() {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = randomBytes(2).toString('hex').toUpperCase();
    return `ONE-${stamp}-${rand}`;
  }

  private async resolveCoupon(code: string | undefined, subtotal: number) {
    if (!code) return { discount: null as CartDiscount | null, couponId: null as string | null };

    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) throw new BadRequestException('That coupon code is not valid.');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('That coupon has expired.');
    }
    if (subtotal < coupon.minSubtotal) {
      throw new BadRequestException('Your cart is below the minimum for this coupon.');
    }
    if (coupon.maxRedemptions && coupon.redemptions >= coupon.maxRedemptions) {
      throw new BadRequestException('That coupon has been fully redeemed.');
    }

    const discount: CartDiscount =
      coupon.type === 'PERCENT'
        ? { code: coupon.code, percentOff: coupon.value }
        : { code: coupon.code, amountOffMillimes: coupon.value };

    return { discount, couponId: coupon.id };
  }

  /** Builds cart lines fresh from the DB — price and stock are never trusted from the client. */
  private async liveCartLines(userId: string): Promise<CartLine[]> {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return [];

    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true, variant: true },
    });

    return items.map((item) => {
      const stock = item.variant?.stock ?? item.product.stock;
      if (stock <= 0) throw new BadRequestException(`${item.product.name} is no longer in stock.`);
      return {
        productId: item.productId,
        variantId: item.variantId,
        slug: item.product.slug,
        name: item.variant ? `${item.product.name} — ${item.variant.optionValue}` : item.product.name,
        brand: item.product.brand,
        optionLabel: item.variant ? `${item.variant.optionName}: ${item.variant.optionValue}` : null,
        unitPriceMillimes: item.variant?.priceMillimes ?? item.product.priceMillimes,
        compareAtMillimes: item.product.compareAtMillimes,
        quantity: clampQuantity(item.quantity, stock),
        stock,
        image: null,
        categorySlug: '',
      };
    });
  }

  async checkout(userId: string, dto: CreateOrderDto) {
    const lines = await this.liveCartLines(userId);
    if (!lines.length) throw new BadRequestException('Your cart is empty.');

    const subtotal = lines.reduce((sum, line) => sum + line.unitPriceMillimes * line.quantity, 0);
    const { discount, couponId } = await this.resolveCoupon(dto.couponCode, subtotal);
    const totals = calculateTotals(lines, discount);

    let addressId = dto.addressId;
    if (addressId) {
      const owned = await this.prisma.address.findFirst({ where: { id: addressId, userId } });
      if (!owned) throw new BadRequestException('That address was not found on your account.');
    } else {
      if (!dto.address) throw new BadRequestException('A delivery address is required.');
      const created = await this.prisma.address.create({ data: { userId, ...dto.address } });
      addressId = created.id;
    }

    const order = await this.prisma.order.create({
      data: {
        reference: this.reference(),
        userId,
        addressId,
        status: 'PENDING',
        subtotal: totals.subtotal,
        discount: totals.discount,
        delivery: totals.delivery,
        total: totals.total,
        couponCode: discount?.code ?? null,
        items: {
          create: lines.map((line) => ({
            productId: line.productId,
            name: line.name,
            optionLabel: line.optionLabel,
            unitPriceMillimes: line.unitPriceMillimes,
            quantity: line.quantity,
          })),
        },
      },
      include: { items: true, address: true },
    });

    if (couponId) {
      await this.prisma.coupon.update({ where: { id: couponId }, data: { redemptions: { increment: 1 } } });
    }

    const intent = await this.payments.createIntent(order.id, order.total);
    return { order, clientSecret: intent.clientSecret, stub: intent.stub };
  }

  /**
   * Confirms payment in stub mode only — with no Stripe keys set, there is nothing
   * for Stripe to notify us about, so this stands in for the webhook and marks the
   * order paid directly. Once STRIPE_SECRET_KEY is set, PaymentsService.isLive flips
   * and this route refuses, so payment confirmation always matches the live flow.
   */
  async confirmStubPayment(userId: string, orderId: string) {
    if (this.payments.isLive) {
      throw new BadRequestException('Live Stripe keys are configured — pay through the real form.');
    }

    const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('Order not found.');

    await this.prisma.payment.update({ where: { orderId: order.id }, data: { status: 'PAID' } });
    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'PROCESSING' },
      include: { items: true, address: true, payment: true },
    });

    await this.prisma.cartItem.deleteMany({ where: { cart: { userId } } });
    return updated;
  }

  findMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, payment: true },
    });
  }

  async findOne(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: true, address: true, payment: true },
    });
    if (!order) throw new NotFoundException('Order not found.');
    return order;
  }

  /** Same shape as findOne, minus the ownership check — for admin views only. */
  async findOneAdmin(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        address: true,
        payment: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found.');
    return order;
  }

  async findAllAdmin(query: QueryOrdersDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { reference: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          items: true,
          payment: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
  }

  async updateStatus(id: string, status: Prisma.OrderUpdateInput['status']) {
    const exists = await this.prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Order not found.');

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        payment: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }
}
