import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artwork } from '../../artworks/entities/artwork.entity';
import { Gallery } from '../../galleries/entities/gallery.entity';
import { Exclude, Expose } from 'class-transformer';

@Entity('loans')
@Exclude()
export class Loan {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'date' })
  startDate: Date;

  @Expose()
  @Column({ type: 'date' })
  endDate: Date;

  @Expose()
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
