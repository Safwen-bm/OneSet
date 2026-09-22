import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

export const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { position: 'asc' } },
  variants: { orderBy: { priceMillimes: 'asc' } },
  specifications: { orderBy: { position: 'asc' } },
} satisfies Prisma.ProductInclude;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: QueryProductsDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = { isActive: true };
    const and: Prisma.ProductWhereInput[] = [];

    if (query.q) {
      and.push({
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { brand: { contains: query.q, mode: 'insensitive' } },
          { shortDescription: { contains: query.q, mode: 'insensitive' } },
          { tags: { has: query.q.toLowerCase() } },
        ],
      });
    }
    if (query.category) and.push({ category: { slug: query.category } });
    if (query.brands?.length) and.push({ brand: { in: query.brands } });
    if (query.tags?.length) and.push({ tags: { hasSome: query.tags } });
    if (query.minPrice !== undefined) and.push({ priceMillimes: { gte: query.minPrice } });
    if (query.maxPrice !== undefined) and.push({ priceMillimes: { lte: query.maxPrice } });
    if (query.minRating !== undefined) and.push({ rating: { gte: query.minRating } });
    if (query.inStock) and.push({ stock: { gt: 0 } });
    if (query.onSale) and.push({ compareAtMillimes: { not: null } });
    if (query.featured) and.push({ isFeatured: true });

    if (and.length) where.AND = and;
    return where;
  }

  private buildOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case 'price-asc':
        return { priceMillimes: 'asc' };
      case 'price-desc':
        return { priceMillimes: 'desc' };
      case 'rating':
        return { rating: 'desc' };
      case 'popular':
        return { reviewCount: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  }

  async findAll(query: QueryProductsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: this.buildOrderBy(query.sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
  }

  /** Filter sidebar data: which brands/tags/prices actually exist in this slice of the catalog. */
  async facets(query: QueryProductsDto) {
    const where = this.buildWhere({ ...query, brands: undefined, tags: undefined });
    const products = await this.prisma.product.findMany({
      where,
      select: { brand: true, tags: true, priceMillimes: true },
    });

    const brandCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();
    let min = Number.MAX_SAFE_INTEGER;
    let max = 0;

    for (const product of products) {
      brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + 1);
      for (const tag of product.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      min = Math.min(min, product.priceMillimes);
      max = Math.max(max, product.priceMillimes);
    }

    const sorted = (map: Map<string, number>) =>
      [...map.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

    return {
      brands: sorted(brandCounts),
      tags: sorted(tagCounts).slice(0, 20),
      priceRange: { min: products.length ? min : 0, max },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug }, include: productInclude });
    if (!product) throw new NotFoundException(`No product with the slug "${slug}".`);
    return product;
  }

  /** "Perfect with" — same-setup cross-sells from neighbouring categories. */
  async related(slug: string, take = 4) {
    const product = await this.findBySlug(slug);
    const sameTags = await this.prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        OR: [{ tags: { hasSome: product.tags } }, { categoryId: { not: product.categoryId } }],
      },
      include: productInclude,
      orderBy: { rating: 'desc' },
      take: take * 3,
    });

    // Prefer different categories so the cross-sell reads as a setup, not "more of the same".
    const diverse: typeof sameTags = [];
    const seenCategories = new Set<string>([product.categoryId]);
    for (const candidate of sameTags) {
      if (!seenCategories.has(candidate.categoryId)) {
        diverse.push(candidate);
        seenCategories.add(candidate.categoryId);
      }
      if (diverse.length === take) break;
    }
    return diverse.length ? diverse : sameTags.slice(0, take);
  }

  async create(dto: CreateProductDto) {
    const { images, variants, specifications, slug, ...rest } = dto;
    return this.prisma.product.create({
      data: {
        ...rest,
        tags: dto.tags ?? [],
        slug: slug ?? (await this.uniqueSlug(slugify(dto.name))),
        images: images?.length ? { create: images } : undefined,
        variants: variants?.length ? { create: variants } : undefined,
        specifications: specifications?.length ? { create: specifications } : undefined,
      },
      include: productInclude,
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureExists(id);
    const { images, variants, specifications, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({ data: images.map((i) => ({ ...i, productId: id })) });
      }
      if (specifications) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
        await tx.productSpecification.createMany({
          data: specifications.map((s) => ({ ...s, productId: id })),
        });
      }
      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        await tx.productVariant.createMany({ data: variants.map((v) => ({ ...v, productId: id })) });
      }
      return tx.product.update({ where: { id }, data: rest, include: productInclude });
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Product not found.');
  }

  private async uniqueSlug(base: string) {
    let slug = base;
    let n = 2;
    while (await this.prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${base}-${n++}`;
    }
    return slug;
  }
}
