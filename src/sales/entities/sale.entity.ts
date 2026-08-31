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

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 12, scale: 2 })
  salePrice: number;

  @Column('decimal', { precision: 5, scale: 4 })
  commissionRate: number;

  @Column('decimal', { precision: 12, scale: 2 })
  commissionAmount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  artistBalance: number;

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
