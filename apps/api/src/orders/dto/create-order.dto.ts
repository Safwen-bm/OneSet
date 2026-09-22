import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

class AddressInput {
  @ApiPropertyOptional({ default: 'Home' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  line1: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  governorate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postalCode: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Use an existing saved address instead of `address`' })
  @IsOptional()
  @IsString()
  addressId?: string;

  @ApiPropertyOptional({ type: AddressInput, description: 'A new address to save and ship to' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressInput)
  address?: AddressInput;

  @ApiPropertyOptional({ example: 'SETUP10' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  couponCode?: string;
}
