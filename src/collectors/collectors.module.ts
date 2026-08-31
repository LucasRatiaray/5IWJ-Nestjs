import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collector } from './entities/collector.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collector])],
})
export class CollectorsModule {}
