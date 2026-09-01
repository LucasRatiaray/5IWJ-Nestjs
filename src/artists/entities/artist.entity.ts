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
import { Exclude, Expose } from 'class-transformer';

@Entity('artists')
@Exclude()
export class Artist {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  firstName: string;

  @Expose()
  @Column()
  lastName: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  biography?: string;

  @Expose()
  @Column({ nullable: true })
  portfolioUrl?: string;

  @Expose()
  @Column({ nullable: true })
  nationality?: string;

  @Expose()
  @Column({ type: 'enum', enum: ArtistStatus, default: ArtistStatus.ACTIVE })
  status: ArtistStatus;

  @Expose()
  @Column({ type: 'date' })
  joinedAt: Date;

  @OneToOne(() => User, (user) => user.artist, { nullable: true })
  @JoinColumn()
  user?: User | null;

  @Expose()
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
