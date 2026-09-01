import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { Artwork } from '../../artworks/entities/artwork.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { ArtistStatement } from '../../artist-statements/entities/artist-statement.entity';
import { Collector } from '../../collectors/entities/collector.entity';
import { Exclude, Expose, Transform } from 'class-transformer';

const toNumber = ({ value }: { value: unknown }) =>
  value == null ? value : Number(value);

@Entity('sales')
@Exclude()
export class Sale {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Transform(toNumber)
  @Column('decimal', { precision: 12, scale: 2 })
  salePrice: number;

  @Expose()
  @Transform(toNumber)
  @Column('decimal', { precision: 5, scale: 4 })
  commissionRate: number;

  @Expose()
  @Transform(toNumber)
  @Column('decimal', { precision: 12, scale: 2 })
  commissionAmount: number;

  @Expose()
  @Transform(toNumber)
  @Column('decimal', { precision: 12, scale: 2 })
  artistBalance: number;

  @Expose()
  @CreateDateColumn({ type: 'timestamptz' })
  soldAt: Date;

  @OneToOne(() => Artwork, (artwork) => artwork.sale, { nullable: false })
  @JoinColumn()
  artwork: Artwork;

  @OneToOne(() => Invoice, (invoice) => invoice.sale, { nullable: false })
  invoice: Invoice;

  @OneToOne(() => ArtistStatement, (artistStatement) => artistStatement.sale, {
    nullable: false,
  })
  artistStatement: ArtistStatement;

  @ManyToOne(() => Collector, (collector) => collector.sales, {
    nullable: false,
  })
  collector: Collector;
}
