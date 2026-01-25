import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllClientsQuery } from '../queries/get-all-clients.query';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { IUser } from '../../domain/schemas/user.schema';
import { Logger, InternalServerErrorException } from '@nestjs/common'; 

@QueryHandler(GetAllClientsQuery)
export class GetAllClientsHandler implements IQueryHandler<GetAllClientsQuery> {
  private readonly logger = new Logger(GetAllClientsHandler.name); 

  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetAllClientsQuery): Promise<IUser[]> {
    const { companyName } = query;
    this.logger.log(`Fetching all client level users for company: ${companyName}`); 

    try {
      const users = await this.userRepository.findUsersRole(companyName);

      this.logger.log(`Successfully fetched ${users.length} client level users for company: ${companyName}`); 
      return users;
    } catch (error) {
      this.logger.error(`Failed to fetch client level users for company: ${companyName}`, error.stack); 
      throw new InternalServerErrorException(`Failed to fetch client level users for company: ${companyName}`); 
    }
  }
}
