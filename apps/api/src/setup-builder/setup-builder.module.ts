import { Module } from '@nestjs/common';
import { SetupBuilderController } from './setup-builder.controller';
import { SetupBuilderService } from './setup-builder.service';

@Module({
  controllers: [SetupBuilderController],
  providers: [SetupBuilderService],
})
export class SetupBuilderModule {}
