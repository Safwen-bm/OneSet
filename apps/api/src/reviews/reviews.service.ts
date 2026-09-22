import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import type { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';

/** A review only counts once the order that contains the product has actually shipped or arrived. */
const PAID_STATUSES: OrderStatus[] = ['PROCESSING', 'SHIPPED', 'DELIVERED'];

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  listForProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }

  private async hasPurchased(userId: string, productId: string) {
    const count = await this.prisma.orderItem.count({
      where: { productId, order: { userId, status: { in: PAID_STATUSES } } },
    });
    return count > 0;
  }

  async myStatus(userId: string, productId: string) {
    const [purchased, existing] = await Promise.all([
      this.hasPurchased(userId, productId),
      this.prisma.review.findUnique({ where: { productId_userId: { productId, userId } } }),
    ]);
    return { canReview: purchased && !existing, alreadyReviewed: Boolean(existing) };
  }

  async create(userId: string, productId: string, dto: CreateReviewDto) {
    const purchased = await this.hasPurchased(userId, productId);
    if (!purchased) {
      throw new ForbiddenException('You can review a product once your order for it is on the way.');
    }

    try {
      const review = await this.prisma.review.create({
        data: { productId, userId, rating: dto.rating, title: dto.title, body: dto.body },
      });
      await this.recalculate(productId);
      return review;
    } catch (error: unknown) {
      if ((error as { code?: string })?.code === 'P2002') {
        throw new ConflictException('You already reviewed this product.');
      }
      throw error;
    }
  }

  /** Keeps Product.rating / reviewCount denormalised so catalog sorting stays cheap. */
  private async recalculate(productId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
        reviewCount: agg._count.rating,
      },
    });
  }
}
