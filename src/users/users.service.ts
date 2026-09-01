import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '../common/database/postgres-errors';
import { UserRole } from './enums/user-role.enum';
import { hashPassword } from '../common/security/password.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  findAll() {
    return this.repository.find();
  }

  async findOneById(id: string) {
    const user = await this.repository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  findByEmailWithPassword(email: string) {
    return this.repository
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email })
      .getOne();
  }

  existsByEmail(email: string) {
    return this.repository.existsBy({ email });
  }

  async create(dto: CreateUserDto, role: UserRole = UserRole.COLLECTOR) {
    const password = await hashPassword(dto.password);
    const user = this.repository.create({ email: dto.email, password, role });
    return this.saveOrConflict(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);
    Object.assign(user, dto);
    return this.saveOrConflict(user);
  }

  async remove(id: string) {
    const user = await this.findOneById(id);
    try {
      return await this.repository.remove(user);
    } catch (error) {
      if (isForeignKeyViolation(error))
        throw new ConflictException(
          'Cannot delete a user with a linked profile — deactivate the account instead',
        );
      throw error;
    }
  }

  async activate(id: string) {
    return this.setActive(id, true);
  }

  async deactivate(id: string) {
    return this.setActive(id, false);
  }

  private async setActive(id: string, isActive: boolean) {
    const user = await this.findOneById(id);
    user.isActive = isActive;
    return this.repository.save(user);
  }

  private async saveOrConflict(user: User): Promise<User> {
    try {
      return await this.repository.save(user);
    } catch (error) {
      if (isUniqueViolation(error))
        throw new ConflictException('Email already in use');
      throw error;
    }
  }
}
