import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({ default: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  quantity?: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ minimum: 0, maximum: 10, description: '0 removes the line' })
  @IsInt()
  @Min(0)
  @Max(10)
  quantity: number;
}

export class MergeCartDto {
  @ApiProperty({ type: [AddCartItemDto], description: 'Guest cart lines to fold into the account cart' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddCartItemDto)
  items: AddCartItemDto[];
}
