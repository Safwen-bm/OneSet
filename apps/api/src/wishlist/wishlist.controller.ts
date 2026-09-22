import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { WishlistService } from './wishlist.service';

class WishlistItemDto {
  @IsString()
  productId: string;
}

@ApiTags('wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.wishlist.list(user.id);
  }

  @Post()
  add(@CurrentUser() user: JwtUser, @Body() dto: WishlistItemDto) {
    return this.wishlist.add(user.id, dto.productId);
  }

  @Post('toggle')
  toggle(@CurrentUser() user: JwtUser, @Body() dto: WishlistItemDto) {
    return this.wishlist.toggle(user.id, dto.productId);
  }

  @Delete(':productId')
  remove(@CurrentUser() user: JwtUser, @Param('productId') productId: string) {
    return this.wishlist.remove(user.id, productId);
  }
}
