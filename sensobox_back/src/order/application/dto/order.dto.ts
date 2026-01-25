import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
export class OrderDto {
  @IsNotEmpty({ message: 'Order number must not be empty' })
  @IsNumber({}, { message: 'Order number must be a number' })
  readonly orderNumber: number;

  @IsNotEmpty({ message: 'Client name must not be empty' })
  @IsString({ message: 'Client name must be a string' })
  readonly clientName: string;

  @IsNotEmpty({ message: 'company Name name must not be empty' })
  @IsString({ message: 'company Name name must be a string' })
  readonly companyName: string;

  @IsNotEmpty({ message: 'Job name must not be empty' })
  @IsString({ message: 'Job name must be a string' })
  readonly workName: string;

  @IsNotEmpty({ message: 'Job type must not be empty' })
  @IsString({ message: 'Job type must be a string' })
  readonly workType: string;

  @IsNotEmpty({ message: 'Production quantity must not be empty' })
  @IsNumber({}, { message: 'Production quantity must be a number' })
  readonly productionQuantity: number;

  @IsNotEmpty({ message: 'Colors must not be empty' })
  @IsString({ message: 'Colors must be a string' })
  readonly colors: string;

  @IsNotEmpty({ message: 'Processes must not be empty' })
  @IsString({ message: 'Processes must be a string' })
  readonly processes: string;

  @IsNotEmpty({ message: 'Special finishes must not be empty' })
  @IsString({ message: 'Special finishes must be a string' })
  readonly specialFinishes: string;

  @IsOptional()
  @IsNumber({}, { message: 'Pallets number must be a number' })
  @Min(0, { message: 'Pallets number must be at least 0' })
  readonly palletsNumber?: number;

  @IsNotEmpty({ message: 'Technician must not be empty' })
  @IsString({ message: 'Technician must be a string' })
  readonly technician: string;

  @IsOptional()
  @IsDate({ message: 'Processing date must be a valid date' })
  @Type(() => Date) // Añade la anotación Type para transformar el campo a Date
  readonly processingDate?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Processing time must be a number' })
  readonly processingTime?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Material area must be a number' })
  readonly materialArea: number;

  @IsOptional()
  @IsNumber({}, { message: 'Material weight must be a number' })
  readonly materialWeight: number;
  
  @IsOptional()
  @IsNumber({}, { message: 'quantityProcessed must be a number' })
  readonly quantityProcessed: number;
}
