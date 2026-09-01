import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PurchaseRequestStatus } from '../enums/purchase-request-status.enum';
import { Artwork } from '../../artworks/entities/artwork.entity';
import { Collector } from '../../collectors/entities/collector.entity';

@Entity('purchase_requests')
export class PurchaseRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PurchaseRequestStatus,
    default: PurchaseRequestStatus.PENDING,
  })
  status: PurchaseRequestStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  requestedAt: Date;

  @ManyToOne(() => Collector, { nullable: false })
  collector: Collector;

  @ManyToOne(() => Artwork, { nullable: false })
  artwork: Artwork;
}
