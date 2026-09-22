import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../products/products.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    return categories.map(({ _count, ...category }) => ({
      ...category,
      productCount: _count.products,
    }));
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException(`No category with the slug "${slug}".`);
    const { _count, ...rest } = category;
    return { ...rest, productCount: _count.products };
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { ...dto, slug: dto.slug ?? slugify(dto.name) },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.ensureExists(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Category not found.');
  }
}
