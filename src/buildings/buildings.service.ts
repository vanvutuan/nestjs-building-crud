import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository, TreeRepository } from 'typeorm';
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
    private readonly locationRepository: TreeRepository<BuildingLocation>,

    private dataSource: DataSource
  ) {}

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    const existBuilding = await this.buildingRepository.exist({where : {name: createBuildingDto.name}});
    if (existBuilding) {
      throw new BadRequestException(`Building name ${createBuildingDto.name} already exists!`);
    }

    const building = this.buildingRepository.create({...createBuildingDto});
    await building.save();
    await this.createLocations(createBuildingDto?.locations, null, building);
  }

  async findAll() {
    const buildings = await this.buildingRepository.find({})
    return buildings;
  }

  async findOne(id: number, populateData = true) {
    const building = await this.buildingRepository.findOne({where: {id: id}});
    if (!building)
      throw new NotFoundException(`Couldn't found building ID ${id}`);

    if (!populateData) {
      return building;
    }

    return await this.getBuildingLocationTree(building);
  }

  async update(id: number, updateBuildingDto: UpdateBuildingDto){
    const existBuilding = await this.findOne(id, false);
    return `This action updates a #${id} building`;
  }

  async remove(id: number, locationId = null): Promise<void>{
    const building = await this.findOne(id);
    const locations = await this.getAllLocations(building, locationId);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(BuildingLocation, {id: In([...locations.map(d => d.id)])}, {parentLocation: null})
      await queryRunner.manager.remove(locations);
      await queryRunner.manager.remove(building);
      await queryRunner.commitTransaction();
    }
    catch (err) {
      console.log("error: ", err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async createLocations(locations: CreateLocationDto[], parentLocation: BuildingLocation, building: Building) {
    if (!locations) {
      return;
    }
    for (let locationData of locations) {
      const location = this.locationRepository.create({...locationData, building, parentLocation})
      await location.save();
      await this.createLocations(locationData?.locations, location, building);
    }
  }

  private async getBuildingLocationTree(building: Building) {
    building.locations = [];

    const buildingLevels = await this.getAllLevels(building);

    for (let level of buildingLevels) {
      var locationTree = await this.locationRepository.findDescendantsTree(level);
      building.locations.push(locationTree);
    }
    return building;
  }

  private async getAllLevels(building: Building): Promise<BuildingLocation[]> {
    return await this.locationRepository
      .createQueryBuilder("locations")
      .innerJoinAndSelect("locations.building", "buildings")
      .where(`buildings.id = ${building.id} and locations.parent_location_id is NULL`)
      .getMany();
  }

  private async getAllLocations(building: Building, locationId: number): Promise<BuildingLocation[]> {
    return await this.locationRepository
      .createQueryBuilder("locations")
      .innerJoinAndSelect("locations.building", "buildings")
      .where(`buildings.id = ${building.id}`)
      .getMany()
  }
}
