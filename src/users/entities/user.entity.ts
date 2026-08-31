import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';
import { Gallery } from '../../galleries/entities/gallery.entity';
import { Artist } from '../../artists/entities/artist.entity';
import { Collector } from '../../collectors/entities/collector.entity';
import { ArtistTransferRequest } from '../../artist-transfer-requests/entities/artist-transfer-request.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COLLECTOR })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => Gallery, (gallery) => gallery.user)
  gallery: Gallery;

  @OneToOne(() => Artist, (artist) => artist.user)
  artist: Artist;

  @OneToOne(() => Collector, (collector) => collector.user)
  collector: Collector;

  @OneToMany(
    () => ArtistTransferRequest,
    (artistTransferRequest) => artistTransferRequest.decidedBy,
  )
  decidedTransferRequests: ArtistTransferRequest[];
}
