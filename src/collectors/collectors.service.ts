import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collector } from './entities/collector.entity';

@Injectable()
export class CollectorsService {
  constructor(
    @InjectRepository(Collector)
    private readonly repository: Repository<Collector>,
  ) {}

  findAll() {
    return this.repository.find();
  }
}
