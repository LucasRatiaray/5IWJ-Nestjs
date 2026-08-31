import {
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArtworkStatus } from '../enums/artwork-status.enum';
import { Gallery } from '../../galleries/entities/gallery.entity';
import { Artist } from '../../artists/entities/artist.entity';
import { ArtworkStatusHistory } from '../../artwork-status-histories/entities/artwork-status-history.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { Exhibition } from '../../exhibitions/entities/exhibition.entity';
import { Loan } from '../../loans/entities/loan.entity';

@Entity('artworks')
export class Artwork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  creationYear?: number;

  @Column()
  technique: string;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  height?: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  width?: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  depth?: number;

  @Column('decimal', { precision: 12, scale: 2 })
  salePrice: number;

  @Column('decimal', { precision: 12, scale: 2 })
  reservePrice: number;

  @Index()
  @Column({
    type: 'enum',
    enum: ArtworkStatus,
    default: ArtworkStatus.AVAILABLE,
  })
  status: ArtworkStatus;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'date' })
  consignedAt: Date;

  @ManyToOne(() => Gallery, (gallery) => gallery.artworks, { nullable: false })
  gallery: Gallery;

  @ManyToOne(() => Artist, (artist) => artist.artworks, { nullable: false })
  artist: Artist;

  @OneToMany(() => ArtworkStatusHistory, (history) => history.artwork)
  artworkStatusHistories: ArtworkStatusHistory[];

  @OneToOne(() => Sale, (sale) => sale.artwork)
  sale: Sale;

  @ManyToMany(() => Exhibition, (exhibition) => exhibition.artworks)
  exhibitions: Exhibition[];

  @OneToMany(() => Loan, (loan) => loan.artwork)
  loans: Loan[];
}
