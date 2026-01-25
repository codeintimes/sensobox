import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../infrastructure/persistence/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: any) {
    const email = payload.email;
    this.logger.log(`Validating user by email: ${email}`); 

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.error(`User validation failed: No user found with email ${email}`); 
      throw new UnauthorizedException(`Access denied: No user found with email ${email}`);
    }

    this.logger.log(`User validated: ${email}`); 
    return { userId: user.id, email: user.email, role: user.role }; 
  }
}
