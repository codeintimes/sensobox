import { IUser } from '../../domain/schemas/user.schema';

export class GetAllClientsQuery {
  constructor(
    public readonly role?: string,
    public readonly companyName?: string 
  ) {}
}