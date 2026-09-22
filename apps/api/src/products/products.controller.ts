import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Paginated, filterable catalog' })
  findAll(@Query() query: QueryProductsDto) {
    return this.products.findAll(query);
  }

  @Public()
  @Get('facets')
  @ApiOperation({ summary: 'Available brands, tags and price range for the current filters' })
  facets(@Query() query: QueryProductsDto) {
    return this.products.facets(query);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }

  @Public()
  @Get(':slug/related')
  @ApiOperation({ summary: '"Perfect with" cross-sells' })
  related(@Param('slug') slug: string) {
    return this.products.related(slug);
  }

  @Roles('ADMIN')
  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Roles('ADMIN')
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Roles('ADMIN')
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }
}
