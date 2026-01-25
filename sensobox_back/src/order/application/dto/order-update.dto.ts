import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsDate } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class OrderUpdateDto {
  @IsOptional()
  @IsNumber({}, { message: 'Order number must be a number' })
  @Transform(({ value }) => Number(value))
  readonly orderNumber?: number;

  @IsOptional()
  @IsString({ message: 'Client name must be a string' })
  readonly clientName?: string;

  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  readonly companyName?: string;

  @IsOptional()
  @IsString({ message: 'Job name must be a string' })
  readonly workName?: string;

  @IsOptional()
  @IsString({ message: 'Job type must be a string' })
  readonly workType?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Production quantity must be a number' })
  @Min(0, { message: 'Production quantity must be at least 0' })
  @Transform(({ value }) => Number(value))
  readonly productionQuantity?: number;

  @IsOptional()
  @IsString({ message: 'Colors must be a string' })
  readonly colors?: string;

  @IsOptional()
  @IsString({ message: 'Processes must be a string' })
  readonly processes?: string;

  @IsOptional()
  @IsString({ message: 'Special finishes must be a string' })
  readonly specialFinishes?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Pallets number must be a number' })
  @Min(0, { message: 'Pallets number must be at least 0' })
  @Transform(({ value }) => Number(value))
  readonly palletsNumber?: number;

  @IsOptional()
  @IsString({ message: 'Technician must be a string' })
  readonly technician?: string;

  @IsOptional()
  @IsDate({ message: 'Processing date must be a valid date' })
  @Type(() => Date)
  readonly processingDate?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Processing time must be a number' })
  @Transform(({ value }) => Number(value))
  readonly processingTime?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Material area must be a number' })
  @Transform(({ value }) => Number(value))
  readonly materialArea?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Material weight must be a number' })
  @Transform(({ value }) => Number(value))
  readonly materialWeight?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Quantity processed must be a number' })
  @Transform(({ value }) => Number(value))
  readonly quantityProcessed?: number;
}
