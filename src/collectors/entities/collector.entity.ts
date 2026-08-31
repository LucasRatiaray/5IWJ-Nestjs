import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('collectors')
export class Collector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @OneToOne(() => User, (user) => user.collector, { nullable: false })
  @JoinColumn()
  user: User;

  @OneToMany(() => Sale, (sale) => sale.collector)
  sales: Sale[];
}
