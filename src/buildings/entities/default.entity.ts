import {
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export default class DefaultEntity extends BaseEntity {
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}