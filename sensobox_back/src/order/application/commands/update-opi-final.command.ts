// update-opi-final.command.ts
import { ICommand } from '@nestjs/cqrs';
import { OpiFinalDTO } from '../dto/opi-final.dto';
// } from 'mongodb';
export class UpdateOpiFinalCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly opiFinalDTO: OpiFinalDTO,
  ) {}
}
