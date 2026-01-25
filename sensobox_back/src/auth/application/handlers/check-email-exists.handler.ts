import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { CheckEmailExistsQuery } from '../queries/check-email-exists.query';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { Logger, InternalServerErrorException } from '@nestjs/common'; 

@QueryHandler(CheckEmailExistsQuery)
export class CheckEmailExistsHandler implements IQueryHandler<CheckEmailExistsQuery> {
  private readonly logger = new Logger(CheckEmailExistsHandler.name); 

  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: CheckEmailExistsQuery): Promise<boolean> {
    const { email } = query;
    this.logger.log(`Checking if email exists: ${email}`); 

    try {
      const exists = await this.userRepository.emailExists(email);
      this.logger.log(`Email check for "${email}": ${exists ? 'exists' : 'does not exist'}`); 
      return exists;
    } catch (error) {
      this.logger.error(`Error checking if email exists: ${email}`, error.stack); 
      throw new InternalServerErrorException('An error occurred while checking if the email exists'); 
    }
  }
}
