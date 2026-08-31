import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArtistTransferRequestStatus } from '../enums/artist-transfer-request-status.enum';
import { Artist } from '../../artists/entities/artist.entity';
import { Gallery } from '../../galleries/entities/gallery.entity';
import { User } from '../../users/entities/user.entity';

@Entity('artist_transfer_requests')
export class ArtistTransferRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ArtistTransferRequestStatus,
    default: ArtistTransferRequestStatus.PENDING,
  })
  status: ArtistTransferRequestStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  requestedAt: Date;

  @ManyToOne(() => Artist, (artist) => artist.artistTransferRequests, {
    nullable: false,
  })
  artist: Artist;

  @ManyToOne(() => Gallery, (gallery) => gallery.outgoingTransferRequests, {
    nullable: false,
  })
  @JoinColumn({ name: 'from_gallery_id' })
  fromGallery: Gallery;

  @ManyToOne(() => Gallery, (gallery) => gallery.incomingTransferRequests, {
    nullable: false,
  })
  @JoinColumn({ name: 'to_gallery_id' })
  toGallery: Gallery;

  @ManyToOne(() => User, (user) => user.decidedTransferRequests, {
    nullable: true,
  })
  decidedBy?: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  decidedAt?: Date | null;
}
