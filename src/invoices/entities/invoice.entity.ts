import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  issuedAt: Date;

  @OneToOne(() => Sale, (sale) => sale.invoice, { nullable: false })
  @JoinColumn()
  sale: Sale;
}
