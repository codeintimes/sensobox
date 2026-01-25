import { IUser } from '../../domain/schemas/user.schema';

export class GetAllUsersQuery {
    constructor(public readonly users: IUser[] = []) {}
  }
  