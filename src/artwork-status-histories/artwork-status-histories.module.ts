import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkStatusHistory } from './entities/artwork-status-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArtworkStatusHistory])],
})
export class ArtworkStatusHistoriesModule {}
