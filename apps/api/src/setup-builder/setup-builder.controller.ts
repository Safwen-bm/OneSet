import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { BuildSetupDto } from './dto/build-setup.dto';
import { SetupBuilderService } from './setup-builder.service';

@ApiTags('setup-builder')
@Controller('setup-builder')
export class SetupBuilderController {
  constructor(private readonly builder: SetupBuilderService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Propose a full setup for a budget and style — rule-based, not random' })
  build(@Body() dto: BuildSetupDto) {
    return this.builder.build(dto);
  }
}
