import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CheckCompatibilityDto {
  @ApiProperty({ type: [String], minItems: 2, description: 'Product ids to check against each other' })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  productIds: string[];
}
