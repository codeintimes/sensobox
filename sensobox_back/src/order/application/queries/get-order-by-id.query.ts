import { IQuery } from '@nestjs/cqrs';
// } from 'mongodb';
export class GetOrderByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}
