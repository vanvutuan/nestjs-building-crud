import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BaseEntity, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Building } from './building.entity';

@Entity()
export class BuildingLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Building, building => building.locations)
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  number: string;

  @Column({ length: 20 })
  area: string;

  @ManyToOne(() => BuildingLocation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_location_id' })
  parentLocation: BuildingLocation;

  @CreateDateColumn({
    default: 'now()',
    nullable: true,
    name: 'created_at',
  })
  createdAt: Date

  @UpdateDateColumn({
    default: 'now()',
    nullable: true,
    name: 'updated_at',
  })
  updatedAt: Date
}