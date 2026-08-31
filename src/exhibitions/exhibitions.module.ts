import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exhibition } from './entities/exhibition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exhibition])],
})
export class ExhibitionsModule {}
