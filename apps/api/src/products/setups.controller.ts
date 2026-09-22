import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Read-only in Sprint 4 — the homepage "ready-made setups" rail reads from real rows.
 * Sprint 9 turns this into the generated setup builder.
 */
@ApiTags('setups')
@Controller('setups')
export class SetupsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Curated setups with their components' })
  async findAll() {
    const presets = await this.prisma.setupPreset.findMany({
      orderBy: { budget: 'asc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true, slug: true } },
                images: { orderBy: { position: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });

    return presets.map((preset) => ({
      ...preset,
      totalMillimes: preset.items.reduce((sum, item) => sum + item.product.priceMillimes, 0),
    }));
  }

  @Public()
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const preset = await this.prisma.setupPreset.findUnique({
      where: { slug },
      include: { items: { include: { product: { include: { images: true } } } } },
    });
    if (!preset) throw new NotFoundException('Setup not found.');
    return preset;
  }
}
