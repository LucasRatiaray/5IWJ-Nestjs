import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { JwtPayload } from '../auth/types/jwt-payload';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) private readonly repository: Repository<Invoice>,
  ) {}

  findAllForCollector(user: JwtPayload) {
    return this.repository.find({
      where: { sale: { collector: { user: { id: user.sub } } } },
    });
  }
}
