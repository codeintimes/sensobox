import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllUsersRoleQuery } from '../queries/get-all-users-role.query';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { IUser } from '../../domain/schemas/user.schema';
import { Logger, InternalServerErrorException } from '@nestjs/common'; 

@QueryHandler(GetAllUsersRoleQuery)
export class GetAllUsersRoleHandler implements IQueryHandler<GetAllUsersRoleQuery> {
  private readonly logger = new Logger(GetAllUsersRoleHandler.name); 

  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetAllUsersRoleQuery): Promise<IUser[]> {
    this.logger.log('Fetching all users with roles admin and technician'); 

    try {
      let users: IUser[];

      if (query.companyName) {
        users = await this.userRepository.findLevelUsers(query.role, query.companyName);
      } else {
        users = await this.userRepository.findLevelUsers(query.role);
      }

      this.logger.log(`Successfully fetched ${users.length} users with roles admin and technician`); 
      return users;
    } catch (error) {
      this.logger.error('Failed to fetch users with roles admin and technician', error.stack); 
      throw new InternalServerErrorException('Failed to fetch users with roles admin and technician'); 
    }
  }
}
