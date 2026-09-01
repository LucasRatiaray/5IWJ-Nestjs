import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';
import { CreatePurchaseRequestDto } from './dtos/create-purchase-request.dto';
import { PurchaseRequestsService } from './purchase-requests.service';

@Controller('purchase-requests')
export class PurchaseRequestsController {
  constructor(
    private readonly purchaseRequestsService: PurchaseRequestsService,
  ) {}

  @Post()
  @Roles(UserRole.COLLECTOR)
  create(
    @Body() body: CreatePurchaseRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.purchaseRequestsService.create(body, user);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.purchaseRequestsService.findAllFor(user);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.GALLERY)
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.purchaseRequestsService.confirm(id, user);
  }

  @Patch(':id/reject')
  @Roles(UserRole.GALLERY)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.purchaseRequestsService.reject(id, user);
  }
}
