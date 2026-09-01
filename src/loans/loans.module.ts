import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './entities/loan.entity';
import { Gallery } from '../galleries/entities/gallery.entity';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, Gallery])],
  providers: [LoansService],
  controllers: [LoansController],
})
export class LoansModule {}
