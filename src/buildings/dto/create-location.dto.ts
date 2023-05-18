import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLocationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  number: string;

  @IsNotEmpty()
  @IsString()
  area: string;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => CreateLocationDto)
  locations?: CreateLocationDto[];
}