import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ArtworkStatus } from '../../artworks/enums/artwork-status.enum';
import { Artwork } from '../../artworks/entities/artwork.entity';

@Entity('artwork_status_histories')
export class ArtworkStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ArtworkStatus, nullable: true })
  fromStatus?: ArtworkStatus | null;

  @Column({ type: 'enum', enum: ArtworkStatus })
  toStatus: ArtworkStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  changedAt: Date;

  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @ManyToOne(() => Artwork, (artwork) => artwork.artworkStatusHistories, {
    nullable: false,
  })
  artwork: Artwork;
}
