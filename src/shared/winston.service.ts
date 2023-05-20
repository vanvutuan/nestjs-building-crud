import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

export async function winstonLogFactory(configService: ConfigService) {
  const appConfig = configService.get<AppConfig>('app');

  return {
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
          winston.format.align(),
          winston.format.printf(
            (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`,
          ),
        ),
        level: appConfig.env == 'production' ? 'error' : 'silly',
      }),
      new winston.transports.File({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
          winston.format.align(),
          winston.format.printf(
            (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`,
          ),
        ),
        level: appConfig.env == 'production' ? 'error' : 'silly',
        filename: appConfig.logPath,
      }),
    ],
  };
}
