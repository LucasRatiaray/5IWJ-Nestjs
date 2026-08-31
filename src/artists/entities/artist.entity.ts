import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArtistStatus } from '../enums/artist-status.enum';
import { User } from '../../users/entities/user.entity';
import { Gallery } from '../../galleries/entities/gallery.entity';
import { Artwork } from '../../artworks/entities/artwork.entity';
import { ArtistTransferRequest } from '../../artist-transfer-requests/entities/artist-transfer-request.entity';

@Entity('artists')
export class Artist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'text', nullable: true })
  biography?: string;

  @Column({ nullable: true })
  portfolioUrl?: string;

  @Column({ nullable: true })
  nationality?: string;

  @Column({ type: 'enum', enum: ArtistStatus, default: ArtistStatus.ACTIVE })
  status: ArtistStatus;

  @Column({ type: 'date' })
  joinedAt: Date;

  @OneToOne(() => User, (user) => user.artist, { nullable: true })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Gallery, (gallery) => gallery.artists, { nullable: false })
  gallery: Gallery;

  @OneToMany(() => Artwork, (artwork) => artwork.artist)
  artworks: Artwork[];

  @OneToMany(
    () => ArtistTransferRequest,
    (artistTransferRequest) => artistTransferRequest.artist,
  )
  artistTransferRequests: ArtistTransferRequest[];
}
