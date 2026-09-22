import { Body, Controller, Get, Param, Patch, Post, Query, RawBodyRequest, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaymentsService } from '../payments/payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly payments: PaymentsService,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Turn the current cart into an order and start payment' })
  checkout(@CurrentUser() user: JwtUser, @Body() dto: CreateOrderDto) {
    return this.orders.checkout(user.id, dto);
  }

  @Post(':id/confirm-stub-payment')
  @ApiOperation({ summary: 'Demo-mode payment confirmation — only works with no Stripe keys set' })
  confirmStub(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.orders.confirmStubPayment(user.id, id);
  }

  // Static path — must come before the ":id" route below, or "mine" is parsed as an id.
  @Get('mine')
  mine(@CurrentUser() user: JwtUser) {
    return this.orders.findMine(user.id);
  }

  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'All orders, with status/search filters — admin only' })
  findAllAdmin(@Query() query: QueryOrdersDto) {
    return this.orders.findAllAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Admins see any order; customers only their own' })
  findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return user.role === 'ADMIN' ? this.orders.findOneAdmin(id) : this.orders.findOne(user.id, id);
  }

  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook — active once STRIPE_WEBHOOK_SECRET is set' })
  async webhook(@Req() request: RawBodyRequest<Request>) {
    const signature = request.headers['stripe-signature'] as string;
    const event = this.payments.constructEvent(request.rawBody!, signature);
    // payment_intent.succeeded handling goes here once live keys are configured.
    return { received: true, type: event.type };
  }
}
