import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Artist } from '../../artists/entities/artist.entity';
import { Artwork } from '../../artworks/entities/artwork.entity';
import { Loan } from '../../loans/entities/loan.entity';
import { ArtistTransferRequest } from '../../artist-transfer-requests/entities/artist-transfer-request.entity';

@Entity('galleries')
export class Gallery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: false })
  isValidated: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToOne(() => User, (user) => user.gallery, { nullable: false })
  @JoinColumn()
  user: User;

  @OneToMany(() => Artist, (artist) => artist.gallery)
  artists: Artist[];

  @OneToMany(() => Artwork, (artwork) => artwork.gallery)
  artworks: Artwork[];

  @OneToMany(() => Loan, (loan) => loan.sourceGallery)
  outgoingLoans: Loan[];

  @OneToMany(() => Loan, (loan) => loan.destinationGallery)
  incomingLoans: Loan[];

  @OneToMany(
    () => ArtistTransferRequest,
    (artistTransferRequest) => artistTransferRequest.fromGallery,
  )
  outgoingTransferRequests: ArtistTransferRequest[];

  @OneToMany(
    () => ArtistTransferRequest,
    (artistTransferRequest) => artistTransferRequest.toGallery,
  )
  incomingTransferRequests: ArtistTransferRequest[];
}
