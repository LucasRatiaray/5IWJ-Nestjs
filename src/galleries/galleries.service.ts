import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gallery } from './entities/gallery.entity';

@Injectable()
export class GalleriesService {
  constructor(
    @InjectRepository(Gallery) private readonly repository: Repository<Gallery>,
  ) {}

  findAll() {
    return this.repository.find();
  }
}
