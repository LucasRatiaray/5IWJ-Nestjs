import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('artist_statements')
export class ArtistStatement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  issuedAt: Date;

  @OneToOne(() => Sale, (sale) => sale.artistStatement, { nullable: false })
  @JoinColumn()
  sale: Sale;
}
