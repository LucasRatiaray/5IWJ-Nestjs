import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artwork } from '../../artworks/entities/artwork.entity';
import { Gallery } from '../../galleries/entities/gallery.entity';

@Entity('exhibitions')
export class Exhibition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ nullable: true })
  location?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToMany(() => Artwork, (artwork) => artwork.exhibitions)
  @JoinTable({ name: 'exhibition_artworks' })
  artworks: Artwork[];

  @ManyToOne(() => Gallery, (gallery) => gallery.exhibitions, {
    nullable: false,
  })
  gallery: Gallery;
}
