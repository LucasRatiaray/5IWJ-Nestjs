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
  Query,
  SerializeOptions,
} from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dtos/create-artwork.dto';
import { UpdateArtworkDto } from './dtos/update-artwork.dto';
import { ArtworkQuotaPipe } from './pipes/artwork-quota.pipe';
import { ParseFrenchDatePipe } from '../common/pipes/parse-french-date.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';

@Controller('artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Post()
  @Roles(UserRole.GALLERY)
  @SerializeOptions({ groups: ['gallery'] })
  create(
    @Body(ArtworkQuotaPipe) body: CreateArtworkDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.artworksService.create(body, user);
  }

  @Get()
  findAll(@Query('consignedAfter', ParseFrenchDatePipe) consignedAfter?: Date) {
    return this.artworksService.findAll(consignedAfter);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.artworksService.findOneById(id);
  }

  @Patch(':id')
  @Roles(UserRole.GALLERY)
  @SerializeOptions({ groups: ['gallery'] })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateArtworkDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.artworksService.update(id, body, user);
  }

  @Delete(':id')
  @Roles(UserRole.GALLERY)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.artworksService.remove(id, user);
  }
}
