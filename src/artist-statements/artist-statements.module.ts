import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistStatement } from './entities/artist-statement.entity';
import { ArtistStatementsService } from './artist-statements.service';
import { ArtistStatementsController } from './artist-statements.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ArtistStatement])],
  providers: [ArtistStatementsService],
  controllers: [ArtistStatementsController],
})
export class ArtistStatementsModule {}
