import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';
import { Gallery } from '../../galleries/entities/gallery.entity';
import { Artist } from '../../artists/entities/artist.entity';
import { Collector } from '../../collectors/entities/collector.entity';
import { ArtistTransferRequest } from '../../artist-transfer-requests/entities/artist-transfer-request.entity';

@Entity('users')
@Exclude()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ unique: true })
  @Expose()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COLLECTOR })
  @Expose()
  role: UserRole;

  @Column({ default: true })
  @Expose()
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Expose()
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
