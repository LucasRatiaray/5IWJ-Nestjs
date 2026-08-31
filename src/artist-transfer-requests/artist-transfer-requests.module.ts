import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistTransferRequest } from './entities/artist-transfer-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArtistTransferRequest])],
})
export class ArtistTransferRequestsModule {}
