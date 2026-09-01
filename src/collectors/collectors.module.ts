import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collector } from './entities/collector.entity';
import { CollectorsService } from './collectors.service';
import { CollectorsController } from './collectors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Collector])],
  providers: [CollectorsService],
  controllers: [CollectorsController],
})
export class CollectorsModule {}
