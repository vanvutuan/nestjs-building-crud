import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLocationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  number: string;

  @IsNotEmpty()
  @IsNumber()
  area: number;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => CreateLocationDto)
  locations?: CreateLocationDto[];
}