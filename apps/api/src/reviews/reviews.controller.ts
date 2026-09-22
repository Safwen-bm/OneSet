import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('products/:slug/reviews')
export class ReviewsController {
  constructor(
    private readonly reviews: ReviewsService,
    private readonly prisma: PrismaService,
  ) {}

  private async productId(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!product) throw new NotFoundException('Product not found.');
    return product.id;
  }

  @Public()
  @Get()
  async list(@Param('slug') slug: string) {
    return this.reviews.listForProduct(await this.productId(slug));
  }

  @ApiBearerAuth()
  @Get('mine')
  async mine(@CurrentUser() user: JwtUser, @Param('slug') slug: string) {
    return this.reviews.myStatus(user.id, await this.productId(slug));
  }

  @ApiBearerAuth()
  @Post()
  async create(@CurrentUser() user: JwtUser, @Param('slug') slug: string, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.id, await this.productId(slug), dto);
  }
}
