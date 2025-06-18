import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  imports: [ProductsModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
