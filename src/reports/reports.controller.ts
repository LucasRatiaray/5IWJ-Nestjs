import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('gallery')
  @Roles(UserRole.GALLERY)
  gallery(@CurrentUser() user: JwtPayload) {
    return this.reportsService.galleryDashboard(user.sub);
  }

  @Get('artist')
  @Roles(UserRole.ARTIST)
  artist(@CurrentUser() user: JwtPayload) {
    return this.reportsService.artistDashboard(user.sub);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  admin() {
    return this.reportsService.adminDashboard();
  }
}
