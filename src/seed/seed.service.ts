import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { INITIAL_DATA } from './data/seed.data';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class SeedService {
  private logger: Logger = new Logger(SeedService.name);

  constructor(
    private productsService: ProductsService,
    private authService: AuthService,
  ) {}

  async populateDB() {
    await this.deleteAllTables();

    const admin = await this.insertSeedUsers();

    await this.insertSeedProducts(admin);

    return `SEED EXECUTED successfully!`;
  }

  private async deleteAllTables() {
    // Delete all products and product images
    await this.productsService.deleteAllProducts();
    // Delete all users
    await this.authService.deleteAllUsers();
  }

  private async insertSeedUsers() {
    const seedUsers = INITIAL_DATA.users;
    // Insert into users table
    const users: User[] = [];

    for (const user of seedUsers) {
      users.push(this.authService.createSeedUser(user));
    }

    const createdUsers = await this.authService.saveSeedUsers(users);
    this.logger.log(`Seed users created: ${createdUsers.length}`);

    return createdUsers[0];
  }

  private async insertSeedProducts(admin: User) {
    const productsToInsert: any[] = [];

    for (const product of INITIAL_DATA.products) {
      productsToInsert.push(this.productsService.create(product, admin));
    }
    try {
      await Promise.all(productsToInsert);
      this.logger.log(`Seed products created: ${INITIAL_DATA.products.length}`);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        `Could not insert SEED data. Please review logs.`,
      );
    }

    return true;
  }
}
