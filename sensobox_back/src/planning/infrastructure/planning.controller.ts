import { Body, Controller, Get, Headers, HttpCode, Param, Patch, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/infrastructure/api/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { resolveLang, tr } from '../../i18n/i18n';
import { PlanningService } from '../application/planning.service';

@ApiTags('planifica')
@ApiBearerAuth()
@Controller('planning')
export class PlanningController {
  constructor(private readonly planning: PlanningService) {}

  @Get('plan')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin', 'technician')
  @ApiOperation({ summary: 'Plan para el diagrama de Gantt' })
  plan(@Query('from') from?: string, @Query('days') days?: string) {
    return this.planning.getPlan(from, Math.min(31, Math.max(1, Number(days ?? 7))));
  }

  @Get('load')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin', 'technician')
  @ApiOperation({ summary: 'Carga por máquina y día' })
  load(@Query('days') days?: string) {
    return this.planning.load(Math.min(31, Math.max(1, Number(days ?? 14))));
  }

  @Post('replan')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  async replan() {
    await this.planning.ritmiaAvailability(true);
    await this.planning.replan();
    return this.planning.getPlan();
  }

  @Patch('operations/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Mover una operación en el Gantt (queda fijada)' })
  move(@Param('id') id: string, @Body() body: any) {
    return this.planning.moveOperation(id, body ?? {});
  }

  @Post('operations/:id/unlock')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  unlock(@Param('id') id: string) {
    return this.planning.unlock(id);
  }

  @Post('simulate')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: '¿Qué pasa si entra este pedido urgente?' })
  simulate(@Body() body: any) {
    return this.planning.simulate(body ?? {});
  }

  @Post('simulate/confirm')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  confirm(@Body() body: any, @Headers('accept-language') lang?: string) {
    return this.planning.confirmUrgent(body ?? {}, resolveLang(lang));
  }

  @Post('orders/:id/link')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  link(@Param('id') id: string, @Body() body: any) {
    return this.planning.link(id, body ?? {});
  }

  @Patch('orders/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  priority(@Param('id') id: string, @Body() body: any) {
    return this.planning.setPriority(id, body ?? {});
  }

  @Get('master')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin', 'technician')
  master() {
    return this.planning.master();
  }

  @Patch('resources/:code')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  updateResource(@Param('code') code: string, @Body() body: any) {
    return this.planning.updateResource(code, body ?? {});
  }

  @Patch('calendars/:code')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  updateCalendar(@Param('code') code: string, @Body() body: any) {
    return this.planning.updateCalendar(code, body ?? {});
  }

  @Post('demo')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Carga la demo de Planifica (?lang=es|en|nl|de|fr|it)' })
  demo(@Query('lang') lang?: string) {
    return this.planning.seedDemo(lang ?? 'es');
  }

  // ----- Integración con Ritmia (clave compartida en INTEGRATION_KEY) -----
  private checkKey(key?: string) {
    if (key !== (process.env.INTEGRATION_KEY || 'ritmia-sensobox-demo')) throw new UnauthorizedException(tr('errors.planning.integrationKey'));
  }

  @Get('integration/dispatch')
  dispatch(@Headers('x-api-key') key?: string) {
    this.checkKey(key);
    return this.planning.dispatch();
  }

  @Get('integration/orders-at-risk')
  ordersAtRisk(@Headers('x-api-key') key?: string, @Query('marginHours') margin?: string) {
    this.checkKey(key);
    return this.planning.atRisk(Math.min(168, Math.max(0, Number(margin ?? 24))));
  }

  @Post('integration/progress')
  @HttpCode(200)
  progress(@Headers('x-api-key') key: string, @Body() body: any) {
    this.checkKey(key);
    return this.planning.progress(body);
  }
}
