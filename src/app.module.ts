import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import configuration from './config/configuration';
import validation from './config/configuration.validation';
import databaseConnection from './shared/databaseConnection';

import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingsModule } from './buildings/buildings.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: validation(),
      load: [configuration],      
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConnection,
      inject: [ConfigService],
    }),
    BuildingsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
