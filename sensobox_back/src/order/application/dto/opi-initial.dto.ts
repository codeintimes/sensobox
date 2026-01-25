import { IsNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class OpiInitialDTO {
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Initial quantity must be a number' })
  readonly initialQuantity: number;

  @IsDateString({}, { message: 'Processing date initial must be a valid date string' })
  readonly processingDateInitial: string;
}
