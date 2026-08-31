import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistStatement } from './entities/artist-statement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArtistStatement])],
})
export class ArtistStatementsModule {}
