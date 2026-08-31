import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Gallery } from '../galleries/entities/gallery.entity';
import { Collector } from '../collectors/entities/collector.entity';
import { isUniqueViolation } from '../common/database/postgres-errors';
import { ConfigService } from '@nestjs/config';
import { RefreshDto } from './dtos/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive)
      throw new UnauthorizedException('Account is not active yet');

    return this.issueTokens(user);
  }

  async register(dto: RegisterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, {
        email: dto.email,
        password: await bcrypt.hash(dto.password, 12),
        role: dto.role,
        isActive: dto.role !== UserRole.GALLERY,
      });
      await queryRunner.manager.save(user);

      if (dto.role === UserRole.GALLERY) {
        const gallery = queryRunner.manager.create(Gallery, {
          name: dto.name,
          user,
        });
        await queryRunner.manager.save(gallery);
      } else {
        const collector = queryRunner.manager.create(Collector, {
          firstName: dto.firstName,
          lastName: dto.lastName,
          user,
        });
        await queryRunner.manager.save(collector);
      }
      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (isUniqueViolation(error)) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async refresh(dto: RefreshDto) {
    let payload: { sub: string };

    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(
        dto.refreshToken,
        { secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET') },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    let user: User;

    try {
      user = await this.usersService.findOneById(payload.sub);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!user.isActive)
      throw new UnauthorizedException('Account is not active yet');

    return this.issueTokens(user);
  }

  private async issueTokens(user: User) {
    return {
      accessToken: await this.jwtService.signAsync({
        sub: user.id,
        role: user.role,
      }),
      refreshToken: await this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.config.getOrThrow<string>(
            'JWT_REFRESH_EXPIRATION',
          ) as JwtSignOptions['expiresIn'],
        },
      ),
    };
  }
}
