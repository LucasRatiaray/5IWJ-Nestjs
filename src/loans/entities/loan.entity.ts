import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artwork } from '../../artworks/entities/artwork.entity';
import { Gallery } from '../../galleries/entities/gallery.entity';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  conditions?: string;

  @ManyToOne(() => Artwork, (artwork) => artwork.loans, { nullable: false })
  artwork: Artwork;

  @ManyToOne(() => Gallery, { nullable: false })
  @JoinColumn({ name: 'source_gallery_id' })
  sourceGallery: Gallery;

  @ManyToOne(() => Gallery, { nullable: false })
  @JoinColumn({ name: 'destination_gallery_id' })
  destinationGallery: Gallery;
}
