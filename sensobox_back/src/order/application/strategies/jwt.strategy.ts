// import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { OpiRepository } from '../../infrastructure/persistence/opi.repository';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   private readonly logger = new Logger(JwtStrategy.name);

//   constructor(private readonly opiRepository: OpiRepository) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: process.env.JWT_SECRET || 'secretKey',
//     });
//   }

//   async validate(payload: any) {
//     const opiId = payload.opiId;
//     this.logger.log(`Validating OPI with ID: ${opiId}`);

//     const opi = await this.opiRepository.findById(opiId);
//     if (!opi) {
//       this.logger.error(`OPI validation failed: No OPI found with ID ${opiId}`);
//       throw new UnauthorizedException(`Access denied: No OPI found with ID ${opiId}`);
//     }

//     this.logger.log(`OPI validated: ${opiId}`);
//     return { opiId: opi.id, title: opi.title, department: opi.department, quantity: opi.quantity, status: opi.status };
//   }
// }
