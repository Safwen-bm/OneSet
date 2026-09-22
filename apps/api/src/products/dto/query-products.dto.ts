import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

const toArray = ({ value }: { value: unknown }): string[] | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value as string[];
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

const toBool = ({ value }: { value: unknown }) => value === true || value === 'true' || value === '1';

export class QueryProductsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Free-text search on name, brand, tags' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Category slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String], description: 'Comma-separated brand list' })
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  brands?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Comma-separated tag list' })
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Minimum price in millimes' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price in millimes' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  onSale?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ enum: ['newest', 'price-asc', 'price-desc', 'rating', 'popular'] })
  @IsOptional()
  @IsIn(['newest', 'price-asc', 'price-desc', 'rating', 'popular'])
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
}
