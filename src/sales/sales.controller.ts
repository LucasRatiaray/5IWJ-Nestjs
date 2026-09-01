import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateSaleDto } from './dtos/create-sale.dto';
import { SalesService } from './sales.service';
import type { JwtPayload } from '../auth/types/jwt-payload';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles(UserRole.GALLERY)
  create(@Body() body: CreateSaleDto, @CurrentUser() user: JwtPayload) {
    return this.salesService.create(body, user);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.salesService.findAllFor(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.salesService.findOneFor(id, user);
  }
}
