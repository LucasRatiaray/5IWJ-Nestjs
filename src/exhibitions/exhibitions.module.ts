import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exhibition } from './entities/exhibition.entity';
import { Gallery } from '../galleries/entities/gallery.entity';
import { ExhibitionsService } from './exhibitions.service';
import { ExhibitionsController } from './exhibitions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exhibition, Gallery])],
  providers: [ExhibitionsService],
  controllers: [ExhibitionsController],
})
export class ExhibitionsModule {}
