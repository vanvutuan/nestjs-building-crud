import { Module } from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { BuildingsController } from './buildings.controller';
import { Building } from './entities/building.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingLocation } from './entities/building-location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Building, BuildingLocation])],
  controllers: [BuildingsController],
  providers: [BuildingsService]
})
export class BuildingsModule {}
