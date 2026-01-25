import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModel, UserSchema } from './domain/schemas/user.schema';
import { AuthController } from './infrastructure/api/auth.controller';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { LoginHandler } from './application/handlers/login.handler';
import { RegisterHandler } from './application/handlers/register.handler';
import { GetAllUsersHandler } from './application/handlers/get-all-users.handler';
import { UpdateUserHandler } from './application/handlers/update-user.handler';
import { DeleteUserHandler } from './application/handlers/delete-user.handler';
import { GetAllUsersRoleHandler } from './application/handlers/get-all-users-role.handler';
import { GetAllClientsHandler } from './application/handlers/get-all-clients.handler';
import { UpdateEcoDataHandler } from './application/handlers/update-eco-user.handler'; // Asegúrate de que la ruta sea correcta



import { CheckEmailExistsHandler } from './application/handlers/check-email-exists.handler';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/services/authentication.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './application/strategies/jwt.strategy';
import { jwtConstants } from './infrastructure/config/jwt.config';
// import { DatabaseModule } from './infrastructure/config/database.module';
// import { DatabaseModule } from '../config/database.module';
import * as dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGODB_URL
// const MONGO_URI = "mongodb+srv://ortirafael8:4Af3QWOC90uEbExk@cluster0.l7wwmea.mongodb.net/sensobox?retryWrites=true&w=majority&appName=Cluster0/sensobox";

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URI),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwtConstants),
    // DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [
    UserRepository, // Asegúrate de adaptar UserRepository para trabajar con Mongoose

    LoginHandler,
    RegisterHandler,
    UpdateUserHandler,
    GetAllUsersHandler,
    DeleteUserHandler,
    CheckEmailExistsHandler,
    AuthService,
    JwtStrategy,
    GetAllUsersRoleHandler,
    GetAllClientsHandler,
    UpdateEcoDataHandler,
  ],
  exports: [UserRepository],
})
export class AuthModule { }
