import { IsNumber, IsDate, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

export class OpiFinalDTO {
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Final quantity must be a number' })
  readonly finalQuantity: number;
  @IsDate({ message: 'Processing date final must be a valid date' })
  @Type(() => Date)
  readonly processingDateFinal: Date;
}
