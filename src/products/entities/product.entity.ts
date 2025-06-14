import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  title: string;

  @Column('float', { default: 0 })
  price: number;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('text', { array: true })
  sizes: string[];

  @Column('text')
  gender: string;

  // TODO:Tags and images

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
