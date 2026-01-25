import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../commands/login.command';
import { AuthService } from '../services/authentication.service';
import { Logger, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly logger = new Logger(LoginHandler.name);

  constructor(private readonly authService: AuthService) {}

  async execute(command: LoginCommand): Promise<{ user: any; token: string }> {
    const { email, password } = command;
    this.logger.log(`Attempting login for email: ${email}`);

    try {
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        this.logger.warn(`Invalid login attempt for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      const token = await this.authService.login(user);
      this.logger.log(`User logged in successfully: ${email}`);
      const userWithAdditionalFields = {
        id: user.id,
        companyName: user.companyName,
        clientName: user.clientName,
        name: user.name,
        email: user.email,
        role: user.role,
        contactName: user.contactName, // Nuevo campo
        contactPhone: user.contactPhone, // Nuevo campo
        contactEmail: user.contactEmail, // Nuevo campo
      };
      return { user: userWithAdditionalFields, token: token.token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn(`Invalid login attempt for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      } else {
        this.logger.error(`Login process failed for email: ${email}`, error.stack);
        throw new InternalServerErrorException('An error occurred while validating the user.');
      }
    }
  }
}
