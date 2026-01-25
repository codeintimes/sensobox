import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDtoUpdate {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString() // Nuevo campo
  contactName?: string;

  @IsOptional()
  @IsString() // Nuevo campo
  contactPhone?: string;

  @IsOptional()
  @IsString() // Nuevo campo
  contactEmail?: string;
}
