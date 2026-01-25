import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from '../../application/dto/login.dto';
import { RegisterCommand } from '../../application/commands/register.command';
import { LoginCommand } from '../../application/commands/login.command';
import { UpdateUserCommand } from '../../application/commands/update-user.command';
import { DeleteUserCommand } from '../../application/commands/delete-user.command';
import { CheckEmailExistsQuery } from '../../application/queries/check-email-exists.query';
import { GetAllUsersQuery } from '../../application/queries/get-all-users.query';
import { UserDto } from '../../application/dto/user.dto';
import { UserDtoUpdate } from '../../application/dto/user-update.dto';
import { RolesGuard } from './roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { GetAllClientsQuery } from '../../application/queries/get-all-clients.query';
import { GetAllUsersRoleQuery } from '../../application/queries/get-all-users-role.query';
import { UpdateEcoDataCommand } from '../../application/commands/update-eco-user.command';

import { JwtService } from '@nestjs/jwt';




@ApiTags('auth')
@Controller('auth')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private jwtService: JwtService,
  ) { }

  // @Post('register')
  // @ApiOperation({ summary: 'Register a new user' })
  // @ApiBody({ type: UserDto })
  // @ApiResponse({ status: 201, description: 'User successfully registered.' })
  // @ApiResponse({ status: 400, description: 'Bad Request.' })
  // async register(@Body() userDto: UserDto) {
  //   return this.commandBus.execute(new RegisterCommand(userDto.email, userDto.password));
  // }

  // src/infrastructure/api/auth.controller.ts
  @Get('users')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'User list retrieved successfully.' })
  async findAllUsers() {
    return this.queryBus.execute(new GetAllUsersQuery());
  }

  @Get('clientRole')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('technician', 'admin', 'superadmin')
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'Client list retrieved successfully.' })
  async findAllUsersRole(@Query('role') role?: string, @Query('companyName')  companyName?: string) {
    //console.log("222",role)
    return this.queryBus.execute(new GetAllUsersRoleQuery(role, companyName));
  }

  @Get('clients')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'Client list retrieved successfully.' })
  async findAllClients(@Query('companyName') companyName?: string) {
    return this.queryBus.execute(new GetAllClientsQuery(companyName));
  }

  @Patch('eco-data')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiResponse({ status: 204, description: 'Eco data updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async updateEcoData(
    @Body() body: { clientName: string, eco: boolean, ecoEmissions: number } 
  ): Promise<void> {
    //console.log("body",body)
    const id = "3";
    const { clientName, eco, ecoEmissions } = body;
    await this.commandBus.execute(new UpdateEcoDataCommand(clientName, eco, ecoEmissions));
  }

  @Get('check-email-exists/:email')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Check if an email exists' })
  @ApiParam({ name: 'email', required: true })
  @ApiResponse({ status: 200, description: 'Email existence checked successfully.' })
  // @ApiBearerAuth()
  async checkEmailExists(@Param('email') email: string) {
    return this.queryBus.execute(new CheckEmailExistsQuery(email));
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with a specific role' })
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('admin', 'superadmin')
  async register(@Body() userDto: UserDto) {
    return this.commandBus.execute(new RegisterCommand(userDto.email, userDto.name, userDto.companyName, userDto.clientName, userDto.password, userDto.role, userDto.contactName, userDto.contactPhone, userDto.contactEmail));
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in an existing user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() loginDto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(loginDto.email, loginDto.password));
  }

  @Post('validate-token')
  validateToken(@Body() body: { token: string }) {
      const decoded = this.jwtService.verify(body.token); // Verifica el token usando la clave pública configurada
      return { isValid: true, decoded };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiBody({ type: UserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBearerAuth()
  async updateUser(@Param('id') id: string, @Body() userDto: UserDtoUpdate) {
    const command = new UpdateUserCommand(id, userDto.name, userDto.email, userDto.password, userDto.contactName, userDto.contactPhone, userDto.contactEmail);
    //console.log("22222")
    const result = await this.commandBus.execute(command);
    return { message: 'User updated successfully', user: result };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Delete an existing user' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBearerAuth()
  async deleteUser(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteUserCommand(id));
    return { message: 'User deleted successfully' };
  }
}
