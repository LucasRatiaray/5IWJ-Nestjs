import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ExhibitionsService } from './exhibitions.service';
import { CreateExhibitionDto } from './dtos/create-exhibition.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';

@Controller('exhibitions')
export class ExhibitionsController {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  @Post()
  @Roles(UserRole.GALLERY)
  create(@Body() body: CreateExhibitionDto, @CurrentUser() user: JwtPayload) {
    return this.exhibitionsService.create(body, user);
  }

  @Get()
  findAll() {
    return this.exhibitionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.exhibitionsService.findOneById(id);
  }

  @Delete(':id')
  @Roles(UserRole.GALLERY, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.exhibitionsService.remove(id, user);
  }
}
