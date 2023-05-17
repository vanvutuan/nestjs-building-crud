import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BuildingLocation } from './building-location.entity';

@Entity()
export class Building extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @OneToMany(() => BuildingLocation, location => location.building)
  locations: BuildingLocation[]

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