import { ICommand } from '@nestjs/cqrs';
import { OpiInitialDTO } from '../dto/opi-initial.dto';
// } from 'mongodb';
export class UpdateOpiInitialCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly opiInitialDTO: OpiInitialDTO,
  ) {}
}