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
import { Exclude, Expose } from 'class-transformer';

@Entity('exhibitions')
@Exclude()
export class Exhibition {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column({ type: 'date' })
  startDate: Date;

  @Expose()
  @Column({ type: 'date' })
  endDate: Date;

  @Expose()
  @Column({ nullable: true })
  location?: string;

  @Expose()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Expose()
  @ManyToMany(() => Artwork, (artwork) => artwork.exhibitions)
  @JoinTable({ name: 'exhibition_artworks' })
  artworks: Artwork[];

  @ManyToOne(() => Gallery, (gallery) => gallery.exhibitions, {
    nullable: false,
  })
  gallery: Gallery;
}
