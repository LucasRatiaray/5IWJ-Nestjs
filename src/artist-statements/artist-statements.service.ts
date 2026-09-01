import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtistStatement } from './entities/artist-statement.entity';
import { JwtPayload } from '../auth/types/jwt-payload';

@Injectable()
export class ArtistStatementsService {
  constructor(
    @InjectRepository(ArtistStatement)
    private readonly repository: Repository<ArtistStatement>,
  ) {}

  findAllFor(user: JwtPayload) {
    return this.repository.find({
      where: { sale: { artwork: { artist: { user: { id: user.sub } } } } },
    });
  }
}
