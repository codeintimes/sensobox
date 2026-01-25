import { IsString } from 'class-validator';

export class UserDto {
  @IsString()
  name: string;

  @IsString()
  clientName: string;

  @IsString()
  companyName: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  role?: string;

  @IsString() // Nuevo campo
  contactName?: string;

  @IsString() // Nuevo campo
  contactPhone?: string;

  @IsString() // Nuevo campo
  contactEmail?: string;
}
