import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto, MergeCartDto, UpdateCartItemDto } from './dto/cart.dto';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  get(@CurrentUser() user: JwtUser) {
    return this.cart.get(user.id);
  }

  @Post('items')
  add(@CurrentUser() user: JwtUser, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(user.id, dto);
  }

  @Patch('items/:id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.cart.updateItem(user.id, id, dto.quantity);
  }

  @Delete('items/:id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.cart.removeItem(user.id, id);
  }

  @Delete()
  clear(@CurrentUser() user: JwtUser) {
    return this.cart.clear(user.id);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Fold a guest cart into the account cart after login' })
  merge(@CurrentUser() user: JwtUser, @Body() dto: MergeCartDto) {
    return this.cart.merge(user.id, dto.items);
  }
}
