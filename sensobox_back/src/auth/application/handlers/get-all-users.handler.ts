import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllUsersQuery } from '../queries/get-all-users.query';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { IUser } from '../../domain/schemas/user.schema';
import { Logger, InternalServerErrorException } from '@nestjs/common'; 

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
  private readonly logger = new Logger(GetAllUsersHandler.name); 

  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetAllUsersQuery): Promise<IUser[]> {
    this.logger.log('Fetching all non-superadmin users'); 

    try {
      // Utiliza el método findNonSuperAdminUsers() para obtener todos los usuarios que no son superadmins
      const users = await this.userRepository.findNonSuperAdminUsers();

      this.logger.log(`Successfully fetched ${users.length} non-superadmin users`); 
      return users;
    } catch (error) {
      this.logger.error('Failed to fetch non-superadmin users', error.stack); 
      throw new InternalServerErrorException('Failed to fetch non-superadmin users'); 
    }
  }
}
