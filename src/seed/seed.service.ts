import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { INITIAL_DATA } from './data/seed.data';

@Injectable()
export class SeedService {
  constructor(private productsService: ProductsService) {}

  async populateDB() {
    await this.insertSeedProducts();

    return `SEED EXECUTED successfully!`;
  }

  private async insertSeedProducts() {
    await this.productsService.deleteAllProducts();

    const productsToInsert: any[] = [];

    for (const product of INITIAL_DATA.products) {
      productsToInsert.push(this.productsService.create(product));
    }
    try {
      await Promise.all(productsToInsert);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        `Could not insert SEED data. Please review logs.`,
      );
    }

    return true;
  }
}
