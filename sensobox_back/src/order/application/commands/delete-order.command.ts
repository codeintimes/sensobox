import { ICommand } from '@nestjs/cqrs';
// } from 'mongodb';
export class DeleteOrderCommand implements ICommand {
  constructor(public readonly id: string) {}
}
