import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { APP_FILTER } from '@nestjs/core';

import configuration from './config/configuration';
import validation from './config/configuration.validation';
import { dbConnectionFactory } from './shared/db-connection';
import { winstonLogFactory } from './shared/winston.service';
import { HttpExceptionFilter } from './shared/http-exception.filter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
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
      inject: [ConfigService],
      useFactory: dbConnectionFactory,
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: winstonLogFactory,
    }),
    BuildingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
