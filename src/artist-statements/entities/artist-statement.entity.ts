import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { Sale } from '../../sales/entities/sale.entity';

const toNumber = ({ value }: { value: unknown }) =>
  value == null ? value : Number(value);

@Entity('artist_statements')
export class ArtistStatement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Transform(toNumber)
  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  issuedAt: Date;

  @OneToOne(() => Sale, (sale) => sale.artistStatement, { nullable: false })
  @JoinColumn()
  sale: Sale;
}
