import { Injectable } from '@nestjs/common';
import { BUILDER_WEIGHTS, budgetShare, pickForBudgetSlice } from '@oneset/types';
import { PrismaService } from '../prisma/prisma.service';
import { productInclude } from '../products/products.service';
import { BuildSetupDto } from './dto/build-setup.dto';

@Injectable()
export class SetupBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async build(dto: BuildSetupDto) {
    const weights = BUILDER_WEIGHTS[dto.style];

    const picks = await Promise.all(
      weights.map(async (slot) => {
        const shareMillimes = budgetShare(dto.budgetMillimes, slot.weightPercent);

        const candidates = await this.prisma.product.findMany({
          where: { category: { slug: slot.categorySlug }, isActive: true, stock: { gt: 0 } },
          include: productInclude,
          orderBy: { priceMillimes: 'asc' },
        });

        const product = pickForBudgetSlice<(typeof candidates)[number]>(candidates, shareMillimes);
        if (!product) return null;

        return {
          role: slot.role,
          categorySlug: slot.categorySlug,
          weightPercent: slot.weightPercent,
          budgetShareMillimes: shareMillimes,
          product,
        };
      }),
    );

    const roles = picks.filter((pick): pick is NonNullable<typeof pick> => Boolean(pick));
    const totalMillimes = roles.reduce((sum, role) => sum + role.product.priceMillimes, 0);
    const onSaleCount = roles.filter((role) => role.product.compareAtMillimes).length;

    return {
      style: dto.style,
      budgetMillimes: dto.budgetMillimes,
      roles,
      totalMillimes,
      remainingMillimes: dto.budgetMillimes - totalMillimes,
      onSaleCount,
    };
  }
}
