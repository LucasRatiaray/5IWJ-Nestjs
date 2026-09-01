import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';
import { ArtistStatementsService } from './artist-statements.service';

@Controller('artist-statements')
export class ArtistStatementsController {
  constructor(
    private readonly artistStatementsService: ArtistStatementsService,
  ) {}

  @Get()
  @Roles(UserRole.ARTIST)
  findAll(@CurrentUser() user: JwtPayload) {
    return this.artistStatementsService.findAllFor(user);
  }
}
