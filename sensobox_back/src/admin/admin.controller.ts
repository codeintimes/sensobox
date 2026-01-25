import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/infrastructure/api/roles.guard';
import { Roles } from '../auth/infrastructure/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'superadmin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('seed')
  @ApiOperation({ summary: 'Execute database seeder (Admin only)' })
  @ApiResponse({ status: 200, description: 'Seeder executed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async seedDatabase() {
    return await this.adminService.seedDatabase();
  }

  @Get('seed/status')
  @ApiOperation({ summary: 'Check seeder status' })
  @ApiResponse({ status: 200, description: 'Status retrieved' })
  async getSeedStatus() {
    const data = await this.adminService.getSeedStatus();
    return {
      success: true,
      data,
    };
  }
}

