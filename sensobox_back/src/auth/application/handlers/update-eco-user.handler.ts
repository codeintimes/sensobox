import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateEcoDataCommand } from '../commands/update-eco-user.command';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { Logger, InternalServerErrorException } from '@nestjs/common';

@CommandHandler(UpdateEcoDataCommand)
export class UpdateEcoDataHandler implements ICommandHandler<UpdateEcoDataCommand> {
  private readonly logger = new Logger(UpdateEcoDataHandler.name);

  constructor(
    private readonly userRepository: UserRepository,
  ) { }

  async execute(command: UpdateEcoDataCommand): Promise<any> {
    this.logger.log(`Attempting to update eco data for users with clientName: ${command.clientName}`);

    try {
      // Prepare the update with only the specified fields
      const eco = command.eco;
      const ecoEmissions = command.ecoEmissions;

      // Execute the update
      const result = await this.userRepository.updateEcoDataByClientName(command.clientName, eco, ecoEmissions);
      this.logger.log(`Eco data for users with clientName: ${command.clientName} updated successfully.`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update eco data for users with clientName: ${command.clientName}`, error.stack);
      throw new InternalServerErrorException(`Failed to update eco data for users with clientName: ${command.clientName}.`);
    }
  }
}
