import { IQuery } from '@nestjs/cqrs';

export class GetAllOrdersTechnicianQuery implements IQuery {
  constructor(public readonly user: { name: string; companyName: string }) {}
}
