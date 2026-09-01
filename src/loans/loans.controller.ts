import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dtos/create-loan.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @Roles(UserRole.GALLERY)
  create(@Body() body: CreateLoanDto, @CurrentUser() user: JwtPayload) {
    return this.loansService.create(body, user);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.loansService.findAllFor(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.loansService.findOneFor(id, user);
  }

  @Patch(':id/return')
  @Roles(UserRole.GALLERY, UserRole.ADMIN)
  return(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.loansService.return(id, user);
  }
}
