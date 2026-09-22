import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: STATUSES })
  @IsIn(STATUSES)
  status: (typeof STATUSES)[number];
}
