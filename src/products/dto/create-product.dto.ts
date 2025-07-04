import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Cool T-Shirt',
    description: 'Product title (must be unique)',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({
    example: 29.99,
    description: 'Product price',
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    example: 'A comfortable and stylish t-shirt.',
    description: 'Optional product description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'cool_t-shirt',
    description: 'Product slug (URL-friendly, unique)',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Number of items in stock',
    minimum: 0,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    example: ['S', 'M', 'L'],
    description: 'Available sizes for the product',
    isArray: true,
    type: String,
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @ApiProperty({
    example: 'men',
    description: 'Target gender for the product',
    enum: ['men', 'women', 'kid', 'unisex'],
  })
  @IsIn(['men', 'women', 'kid', 'unisex'])
  @IsString()
  gender: string;

  @ApiProperty({
    example: ['t-shirt', 'summer', 'cotton'],
    description: 'Tags for the product',
    isArray: true,
    type: String,
    default: [],
  })
  @IsString({ each: true })
  @IsArray()
  tags: string[];

  @ApiPropertyOptional({
    example: [
      'https://myshop.com/images/product-1.jpg',
      'https://myshop.com/images/product-2.jpg',
    ],
    description: 'List of product image URLs',
    isArray: true,
    type: String,
    default: [],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
