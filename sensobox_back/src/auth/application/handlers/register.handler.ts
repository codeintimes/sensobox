import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { RegisterCommand } from '../commands/register.command';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import * as bcrypt from 'bcrypt';
import { Logger, ConflictException, InternalServerErrorException } from '@nestjs/common'; 
import { IUser } from '../../domain/schemas/user.schema';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  private readonly logger = new Logger(RegisterHandler.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: RegisterCommand): Promise<IUser> {
    const { name, companyName, clientName, email, password, role, contactName, contactPhone, contactEmail } = command; // Añadir los campos contactName, contactPhone, contactEmail
    this.logger.log(`Attempting to register user with email: ${name} and email: ${email} and role: ${role}`); 
  
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`Registration attempt failed: Email ${email} is already registered`);
      throw new ConflictException(`Email ${email} is already registered`);
    }
  
    // const existingUserByName = await this.userRepository.findByName(name);
    // if (existingUserByName) {
    //   this.logger.warn(`Registration attempt failed: Name ${name} is already taken`);
    //   throw new ConflictException(`Name ${name} is already taken`);
    // }
  //console.log("command",command)
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser: IUser = await this.userRepository.createUser({
        name,
        companyName,
        clientName,
        email,
        password: hashedPassword,
        role,
        contactName,
        contactPhone,
        contactEmail,
      });
  
      this.logger.log(`User registered successfully: ${email}, Role: ${role}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Failed to register user ${email}`, error.stack);
      throw new InternalServerErrorException('Failed to register user due to an unexpected error');
    }
  }
  
}
