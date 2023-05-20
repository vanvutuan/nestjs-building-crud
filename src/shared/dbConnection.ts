import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default (configService: ConfigService): TypeOrmModuleOptions => {
  const dbConfig = configService.get<DbConfig>('db');
  const appConfig = configService.get<AppConfig>('app');
  return {
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.name,
    synchronize: appConfig.env == 'development' ? true : false,
    autoLoadEntities: true,
  };
};
