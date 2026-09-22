import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Min } from 'class-validator';

const STYLES = ['PERFORMANCE', 'BALANCED', 'AESTHETIC'] as const;

export class BuildSetupDto {
  @ApiProperty({ description: 'Budget in millimes (1 TND = 1000)', example: 1_500_000 })
  @IsInt()
  @Min(50_000)
  budgetMillimes: number;

  @ApiProperty({ enum: STYLES })
  @IsIn(STYLES)
  style: (typeof STYLES)[number];
}
