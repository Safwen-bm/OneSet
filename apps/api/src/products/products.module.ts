import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SetupsController } from './setups.controller';

@Module({
  controllers: [ProductsController, SetupsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
