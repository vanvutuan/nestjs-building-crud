import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BuildingLocation } from './location.entity';
import DefaultEntity from './default.entity';

@Entity('buildings')
export class Building extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column({ length: 10 })
  code: string;

  @OneToMany(() => BuildingLocation, (location) => location.building)
  locations: BuildingLocation[];
}
