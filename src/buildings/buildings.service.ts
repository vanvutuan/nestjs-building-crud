import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository, TreeRepository } from 'typeorm';
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

    private dataSource: DataSource,
  ) {}

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    const existBuilding = await this.buildingRepository.exist({
      where: { name: createBuildingDto.name },
    });
    if (existBuilding) {
      throw new ConflictException(
        `Building name ${createBuildingDto.name} already exists!`,
      );
    }

    const building = this.buildingRepository.create({ ...createBuildingDto });
    await building.save();
    await this.createLocations(createBuildingDto.locations, null, building);
    return await this.getBuildingLocationTree(building);
  }

  async findAll() {
    const buildings = await this.buildingRepository.find();
    return buildings;
  }

  async findOne(id: number, populateData = true) {
    const building = await this.buildingRepository.findOne({
      where: { id: id },
    });

    if (!building) {
      throw new NotFoundException(`Couldn't found building ID ${id}`);
    }

    if (!populateData) {
      return building;
    }

    return await this.getBuildingLocationTree(building);
  }

  async findLocations(id: number, locationId: number) {
    const existBuilding = await this.findOne(id, false);

    const location = await this.locationRepository.findOne({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException(`Couldn't found location ID ${id}`);
    }

    return await this.locationRepository.findDescendants(location);
  }

  async update(id: number, updateBuildingDto: UpdateBuildingDto) {
    const existBuilding = await this.findOne(id, false);
    delete updateBuildingDto.locations;

    const updateResults = await this.buildingRepository.update(
      existBuilding.id,
      updateBuildingDto,
    );
    if (updateResults.affected == 1) {
      return await this.findOne(id);
    } else {
      throw new InternalServerErrorException(
        `Something went wrong when updating building ID ${id}`,
      );
    }
  }

  async addNewLocations(
    id: number,
    locationId: number,
    createLocationDto: CreateLocationDto,
  ) {
    const existBuilding = await this.findOne(id, true);

    // locationId == null: add new level and its locations to the building
    if (locationId == null) {
      await this.createLocations([createLocationDto], null, existBuilding);
    } else {
      // locationId != null: add new location and its location to the under the current parent location
      const savedLocations = await this.getAllLocations(id);
      const location = savedLocations.find((e) => e.id == locationId);
      if (!location) {
        throw new BadRequestException(
          `Location ID ${locationId} is not exists in building ID ${id}`,
        );
      }

      await this.createLocations([createLocationDto], location, existBuilding);
    }

    return this.findOne(id, true);
  }

  async remove(id: number): Promise<void> {
    const building = await this.findOne(id);
    const locations = await this.getAllLocations(building.id);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        BuildingLocation,
        { id: In([...locations.map((d) => d.id)]) },
        { parentLocation: null },
      );
      await queryRunner.manager.remove(locations);
      await queryRunner.manager.remove(building);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Couldn't finish removing building ID ${id}. Nothing changed after this.`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async createLocations(
    locations: CreateLocationDto[],
    parentLocation: BuildingLocation,
    building: Building,
  ) {
    if (!locations || locations.length == 0) {
      return;
    }
    for (let locationData of locations) {
      if (parentLocation == null) {
        locationData.number = building.code + '-' + locationData.code;
      } else {
        locationData.number = parentLocation.number + '-' + locationData.code;
      }
      const location = this.locationRepository.create({
        ...locationData,
        building,
        parentLocation,
      });
      await location.save();
      await this.createLocations(locationData?.locations, location, building);
    }
  }

  private async getBuildingLocationTree(building: Building) {
    building.locations = [];

    const buildingLevels = await this.getAllLocations(building.id, true);

    for (let level of buildingLevels) {
      var locationTree = await this.locationRepository.findDescendantsTree(
        level,
      );
      building.locations.push(locationTree);
    }
    return building;
  }

  private async getAllLocations(
    buildingId: number,
    onlyRootLevel = false,
  ): Promise<BuildingLocation[]> {
    const query = this.locationRepository
      .createQueryBuilder('locations')
      .where(`building_id = ${buildingId}`);

    if (onlyRootLevel) {
      query.andWhere('parent_location_id is NULL');
    }

    return await query.getMany();
  }
}
