import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
// import { Auth } from '../auth/decorators/auth.decorator';
// import { ValidRoles } from 'src/auth/models/roles.enum';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  // @Auth(ValidRoles.SUPER_USER, ValidRoles.ADMIN)
  executeSeed() {
    return this.seedService.populateDB();
  }
}
