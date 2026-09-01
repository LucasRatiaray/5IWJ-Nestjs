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
import { Exclude, Expose, Transform } from 'class-transformer';

const toNumber = ({ value }: { value: unknown }) =>
  value == null ? value : Number(value);

@Entity('artworks')
@Exclude()
export class Artwork {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  title: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Expose()
  @Column({ nullable: true })
  creationYear?: number;

  @Expose()
  @Column()
  technique: string;

  @Expose()
  @Transform(toNumber)
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  height?: number;

  @Expose()
  @Transform(toNumber)
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  width?: number;

  @Expose()
  @Transform(toNumber)
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  depth?: number;

  @Expose()
  @Transform(toNumber)
  @Column('decimal', { precision: 12, scale: 2 })
  salePrice: number;

  @Expose({ groups: ['gallery'] })
  @Transform(toNumber)
  @Column('decimal', { precision: 12, scale: 2 })
  reservePrice: number;

  @Expose()
  @Index()
  @Column({
    type: 'enum',
    enum: ArtworkStatus,
    default: ArtworkStatus.AVAILABLE,
  })
  status: ArtworkStatus;

  @Expose()
  @Column({ nullable: true })
  imageUrl?: string;

  @Expose()
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
