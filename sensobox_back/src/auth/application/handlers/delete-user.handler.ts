import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../commands/delete-user.command';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { Logger, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common'; 

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  private readonly logger = new Logger(DeleteUserHandler.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    this.logger.log(`Attempting to delete user with ID: ${command.id}`);

    const userRole = await this.userRepository.findUserRoleById(command.id);
    if (userRole === 'superadmin') {
      this.logger.error(`Attempt to delete a superadmin user with ID: ${command.id}`);
      throw new ForbiddenException('Deleting a superadmin user is forbidden.');
    }

    const userExists = await this.userRepository.userExistsById(command.id);
    if (!userExists) {
      this.logger.warn(`User with ID: ${command.id} not found`);
      throw new NotFoundException(`User with ID: ${command.id} not found`);
    }    

    try {
      const deleted = await this.userRepository.delete(command.id);
      if (!deleted) {
        this.logger.error(`Failed to delete user with ID: ${command.id}`);
        throw new InternalServerErrorException(`Failed to delete user with ID: ${command.id}`);
      }

      this.logger.log(`User with ID: ${command.id} successfully deleted`);
    } catch (error) {
      this.logger.error(`Unexpected error during deletion of user with ID: ${command.id}`, error.stack);
      throw new InternalServerErrorException('Unexpected error occurred during user deletion');
    }
  }
}
