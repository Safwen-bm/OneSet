import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { calculateTotals, clampQuantity, type CartLine } from '@oneset/types';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateCart(userId: string) {
    const existing = await this.prisma.cart.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.cart.create({ data: { userId } });
  }

  async get(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
      orderBy: { createdAt: 'asc' },
      include: {
        variant: true,
        product: {
          include: {
            category: { select: { slug: true } },
            images: { orderBy: { position: 'asc' }, take: 1 },
          },
        },
      },
    });

    const lines: (CartLine & { id: string })[] = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      slug: item.product.slug,
      name: item.product.name,
      brand: item.product.brand,
      optionLabel: item.variant ? `${item.variant.optionName}: ${item.variant.optionValue}` : null,
      unitPriceMillimes: item.variant?.priceMillimes ?? item.product.priceMillimes,
      compareAtMillimes: item.product.compareAtMillimes,
      quantity: item.quantity,
      stock: item.variant?.stock ?? item.product.stock,
      image: item.product.images[0]?.url ?? null,
      categorySlug: item.product.category.slug,
    }));

    return { id: cart.id, lines, totals: calculateTotals(lines) };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found.');

    let stock = product.stock;
    if (dto.variantId) {
      const variant = await this.prisma.productVariant.findUnique({ where: { id: dto.variantId } });
      if (!variant || variant.productId !== product.id) {
        throw new BadRequestException('That option does not belong to this product.');
      }
      stock = variant.stock;
    }
    if (stock <= 0) throw new BadRequestException('This item is out of stock.');

    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: dto.productId, variantId: dto.variantId ?? null },
    });

    const quantity = clampQuantity((existing?.quantity ?? 0) + (dto.quantity ?? 1), stock);

    if (existing) {
      await this.prisma.cartItem.update({ where: { id: existing.id }, data: { quantity } });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId: dto.productId, variantId: dto.variantId ?? null, quantity },
      });
    }

    return this.get(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true, variant: true },
    });
    if (!item) throw new NotFoundException('That item is no longer in your cart.');

    if (quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: item.id } });
      return this.get(userId);
    }

    const stock = item.variant?.stock ?? item.product.stock;
    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: clampQuantity(quantity, stock) },
    });
    return this.get(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    return this.get(userId);
  }

  async clear(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.get(userId);
  }

  /** Called right after login so a guest cart is not lost. */
  async merge(userId: string, items: AddCartItemDto[]) {
    for (const item of items) {
      try {
        await this.addItem(userId, item);
      } catch {
        // A stale guest line (deleted product, out of stock) must not break the login flow.
      }
    }
    return this.get(userId);
  }
}
