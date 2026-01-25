import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../commands/update-user.command';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import * as bcrypt from 'bcrypt';
import { Logger, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common'; 

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  private readonly logger = new Logger(UpdateUserHandler.name);

  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<any> {
    this.logger.log(`Attempting to update user with ID: ${command.id}`);
    //console.log("3333")
    // Check user role before proceeding
    const userRole = await this.userRepository.findUserRoleById(command.id);
    if (userRole === 'superadmin') {
      this.logger.error(`Attempt to update a superadmin user with ID: ${command.id}`);
      throw new ForbiddenException('Updating a superadmin user is forbidden.');
    }

    // Check if user exists before attempting update
    const existingUser = await this.userRepository.findById(command.id);
    if (!existingUser) {
      this.logger.error(`User with ID ${command.id} not found.`);
      throw new NotFoundException(`User with ID ${command.id} not found.`);
    }
   //console.log("existingUser",existingUser)
    try {
      const userUpdate = {
        id: command.id,  // Ensure ID is included explicitly
        name: command.name ? command.name : existingUser.name,
        email: command.email ? command.email : existingUser.email,
        password: command.password ? await bcrypt.hash(command.password, 10) : existingUser.password,
        contactName: command.contactName ? command.contactName : existingUser.contactName, // Nuevo campo
        contactPhone: command.contactPhone ? command.contactPhone : existingUser.contactPhone, // Nuevo campo
        contactEmail: command.contactEmail ? command.contactEmail : existingUser.contactEmail // Nuevo campo
      };

      // Execute the update
      //console.log("existingUser",userUpdate)
      const updatedUser = await this.userRepository.update(userUpdate);
      this.logger.log(`User with ID: ${command.id} updated successfully.`);
      return updatedUser; 
    } catch (error) {
      this.logger.error(`Failed to update user with ID: ${command.id}`, error.stack);
      throw new InternalServerErrorException(`Failed to update user with ID: ${command.id}.`);
    }
  }
}
