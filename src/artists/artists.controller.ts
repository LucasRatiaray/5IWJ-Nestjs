import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dtos/create-artist.dto';
import { UpdateArtistDto } from './dtos/update-artist.dto';
import { TransferArtistDto } from './dtos/transfer-artist.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Post()
  @Roles(UserRole.GALLERY)
  create(@Body() body: CreateArtistDto, @CurrentUser() user: JwtPayload) {
    return this.artistsService.create(body, user);
  }

  @Get()
  @Roles(UserRole.GALLERY, UserRole.ADMIN)
  findAll(@CurrentUser() user: JwtPayload) {
    return this.artistsService.findAllFor(user);
  }

  @Get(':id')
  @Roles(UserRole.GALLERY, UserRole.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.artistsService.findOneById(id);
  }

  @Patch(':id')
  @Roles(UserRole.GALLERY)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateArtistDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.artistsService.update(id, body, user);
  }

  @Delete(':id')
  @Roles(UserRole.GALLERY)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.artistsService.remove(id, user);
  }

  @Patch(':id/transfer')
  @Roles(UserRole.ADMIN)
  transfer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: TransferArtistDto,
  ) {
    return this.artistsService.transfer(id, body.toGalleryId);
  }
}
