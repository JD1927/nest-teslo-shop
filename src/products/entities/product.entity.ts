import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { ProductImage } from './product-image.entity';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    type: String,
    format: 'uuid',
    example: '17e6fa45-d127-43f1-b897-4610004e66b3',
    description: 'Unique identifier for the product',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Cool T-Shirt',
    description: 'Product title (must be unique)',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  title: string;

  @ApiProperty({
    example: 29.99,
    description: 'Product price',
  })
  @Column('float', { default: 0 })
  price: number;

  @ApiProperty({
    required: false,
    example: 'A comfortable and stylish t-shirt.',
    description: 'Optional product description',
  })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({
    example: 'cool_t-shirt',
    description: 'Product slug (URL-friendly, unique)',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({
    example: 100,
    description: 'Number of items in stock',
  })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L'],
    description: 'Available sizes for the product',
    isArray: true,
    type: String,
  })
  @Column('text', { array: true })
  sizes: string[];

  @ApiProperty({
    example: 'men',
    description: 'Target gender for the product',
  })
  @Column('text')
  gender: string;

  @ApiProperty({
    example: ['t-shirt', 'summer', 'cotton'],
    description: 'Tags for the product',
    isArray: true,
    type: String,
    default: [],
  })
  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty({
    type: () => [ProductImage],
    description: 'List of product images',
    example: [{ id: 1, url: 'https://example.com/image1.jpg' }],
    isArray: true,
    default: [],
  })
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.products, { eager: true })
  user?: User;

  @BeforeInsert()
  checkSlugInsert(): void {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.getSlugFormat();
  }

  @BeforeUpdate()
  checkSlugUpdate(): void {
    if (!this.slug) return;

    this.slug = this.getSlugFormat();
  }

  private getSlugFormat(): string {
    const formatted = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '')
      .replaceAll(',', '')
      .replaceAll('.', '');
    return formatted;
  }
}
