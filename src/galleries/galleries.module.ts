import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gallery } from './entities/gallery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gallery])],
})
export class GalleriesModule {}
