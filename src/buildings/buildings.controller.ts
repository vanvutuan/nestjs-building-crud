import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { CreateLocationDto } from './dto/create-location.dto';

@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  async create(@Body() createBuildingDto: CreateBuildingDto) {
    return await this.buildingsService.create(createBuildingDto);
  }

  @Get()
  async findAll() {
    return await this.buildingsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.buildingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    return this.buildingsService.update(id, updateBuildingDto);
  }

  @Patch(':id/locations')
  createNewLevel(
    @Param('id', ParseIntPipe) id: number,
    @Body() createLocationDto: CreateLocationDto,
  ) {
    return this.buildingsService.addNewLocations(id, null, createLocationDto);
  }

  @Patch(':id/locations/:locationId')
  updateLocation(
    @Param('id', ParseIntPipe) id: number,
    @Param('locationId', ParseIntPipe) locationId: number,
    @Body() createLocationDto: CreateLocationDto,
  ) {
    return this.buildingsService.addNewLocations(
      id,
      locationId,
      createLocationDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.buildingsService.remove(id);
  }
}
