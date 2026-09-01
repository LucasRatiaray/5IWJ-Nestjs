import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CollectorsService } from './collectors.service';

@Controller('collectors')
export class CollectorsController {
  constructor(private readonly collectorsService: CollectorsService) {}

  @Get()
  @Roles(UserRole.GALLERY, UserRole.ADMIN)
  findAll() {
    return this.collectorsService.findAll();
  }
}
