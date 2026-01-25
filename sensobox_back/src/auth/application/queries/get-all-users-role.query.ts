import { IUser } from '../../domain/schemas/user.schema';

export class GetAllUsersRoleQuery {
    constructor(public readonly role?: string, public readonly companyName?: string) {}
}
