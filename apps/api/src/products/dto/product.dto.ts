import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

class ProductImageInput {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  alt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  position?: number;
}

class ProductVariantInput {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  sku: string;

  @ApiProperty({ example: 'Colour' })
  @IsString()
  optionName: string;

  @ApiProperty({ example: 'Graphite' })
  @IsString()
  optionValue: string;

  @ApiPropertyOptional({ example: '#2B2B2F' })
  @IsOptional()
  @IsString()
  swatchHex?: string;

  @ApiProperty({ description: 'Price in millimes' })
  @IsInt()
  @Min(0)
  priceMillimes: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  stock: number;
}

class ProductSpecInput {
  @ApiProperty()
  @IsString()
  group: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  position?: number;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ description: 'Generated from the name when omitted' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsString()
  shortDescription: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Price in millimes (129000 = 129.000 TND)' })
  @IsInt()
  @Min(0)
  priceMillimes: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  compareAtMillimes?: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ type: [ProductImageInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInput)
  images?: ProductImageInput[];

  @ApiPropertyOptional({ type: [ProductVariantInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantInput)
  variants?: ProductVariantInput[];

  @ApiPropertyOptional({ type: [ProductSpecInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecInput)
  specifications?: ProductSpecInput[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
