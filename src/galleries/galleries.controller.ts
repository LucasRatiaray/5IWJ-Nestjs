import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { GalleriesService } from './galleries.service';

@Controller('galleries')
export class GalleriesController {
  constructor(private readonly galleriesService: GalleriesService) {}

  @Get()
  @Roles(UserRole.GALLERY, UserRole.ADMIN)
  findAll() {
    return this.galleriesService.findAll();
  }
}
