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

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Transform(toNumber)
  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  issuedAt: Date;

  @OneToOne(() => Sale, (sale) => sale.invoice, { nullable: false })
  @JoinColumn()
  sale: Sale;
}
