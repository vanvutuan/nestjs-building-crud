import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLocationDto } from './create-location.dto';

export class CreateBuildingDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @ValidateNested({ each: true })
  @Type(() => CreateLocationDto)
  @IsArray()
  locations: CreateLocationDto[];
}
