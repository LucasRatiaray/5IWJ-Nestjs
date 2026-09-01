import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { UsersModule } from './users/users.module';
import { GalleriesModule } from './galleries/galleries.module';
import { ArtistsModule } from './artists/artists.module';
import { CollectorsModule } from './collectors/collectors.module';
import { ArtworksModule } from './artworks/artworks.module';
import { ArtworkStatusHistoriesModule } from './artwork-status-histories/artwork-status-histories.module';
import { SalesModule } from './sales/sales.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ArtistStatementsModule } from './artist-statements/artist-statements.module';
import { ExhibitionsModule } from './exhibitions/exhibitions.module';
import { LoansModule } from './loans/loans.module';
import { ArtistTransferRequestsModule } from './artist-transfer-requests/artist-transfer-requests.module';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local'],
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    UsersModule,
    GalleriesModule,
    ArtistsModule,
    CollectorsModule,
    ArtworksModule,
    ArtworkStatusHistoriesModule,
    SalesModule,
    InvoicesModule,
    ArtistStatementsModule,
    ExhibitionsModule,
    LoansModule,
    ArtistTransferRequestsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
