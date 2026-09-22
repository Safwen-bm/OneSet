import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CompatibilityService } from './compatibility.service';
import { CheckCompatibilityDto } from './dto/check-compatibility.dto';

@ApiTags('compatibility')
@Controller('compatibility')
export class CompatibilityController {
  constructor(private readonly compatibility: CompatibilityService) {}

  @Public()
  @Get('rules')
  @ApiOperation({ summary: 'Active compatibility rules, for transparency' })
  listRules() {
    return this.compatibility.listRules();
  }

  @Public()
  @Post('check')
  @ApiOperation({ summary: 'Check a set of products against every active rule that applies to them' })
  check(@Body() dto: CheckCompatibilityDto) {
    return this.compatibility.check(dto);
  }
}
