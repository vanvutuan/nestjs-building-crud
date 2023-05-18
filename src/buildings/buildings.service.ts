import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Building } from './entities/building.entity';
import { BuildingLocation } from './entities/location.entity';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,

    @InjectRepository(BuildingLocation)
    private readonly locationRepository: TreeRepository<BuildingLocation>
  ) {}

  async create(createBuildingDto: CreateBuildingDto) {
    const existBuilding = await this.buildingRepository.exist({where : {name: createBuildingDto.name}});
    if (existBuilding) {
      throw new BadRequestException(`Building name ${createBuildingDto.name} already exists!`);
    }

    const building = this.buildingRepository.create({...createBuildingDto});
    await building.save();
    await this.createLocations(createBuildingDto?.locations, null, building)

  }

  async createLocations(locations: CreateLocationDto[], parentLocation: BuildingLocation, building: Building) {
    if (!locations) {
      return;
    }
    for (let locationData of locations) {
      const location = this.locationRepository.create({...locationData, building, parentLocation})
      await location.save();
      await this.createLocations(locationData?.locations, location, building);
    }
  }

  async findAll() {
    const buildings = await this.buildingRepository.find({})
    return buildings;
  }

  async findOne(id: number) {
    const building = await this.buildingRepository.findOne({where: {id: id}});
    if (!building)
      throw new NotFoundException(`Couldn't found building id ${id}`);

    
    building.locations = [];

    const buildingLocationRoots = await this.locationRepository
      .createQueryBuilder("locations")
      .innerJoinAndSelect("locations.building", "buildings")
      .where(`buildings.id = ${building.id} and locations.parent_location_id is NULL`)
      .getMany();

    for (let locationRoot of buildingLocationRoots) {
      var locationTree = await this.locationRepository.findDescendantsTree(locationRoot);
      building.locations.push(locationTree);
    }
    return building;
  }

  update(id: number, updateBuildingDto: UpdateBuildingDto) {
    return `This action updates a #${id} building`;
  }

  remove(id: number) {
    return `This action removes a #${id} building`;
  }
}
