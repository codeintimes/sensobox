import { Controller, Get, Headers, Param, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { tr } from '../../i18n/i18n';
import { PlanningService } from '../application/planning.service';

/** Acceso de otras apps (Acopia) a las OF: `Authorization: Bearer <INTEGRATION_KEY>` o `x-api-key`. */
export function integrationKeyOk(auth?: string, key?: string) {
  const expected = process.env.INTEGRATION_KEY || 'ritmia-sensobox-demo';
  const bearer = /^Bearer\s+(.+)$/i.exec(auth ?? '')?.[1];
  return bearer === expected || key === expected;
}

@ApiTags('planifica')
@Controller('api/of')
export class OfController {
  constructor(private readonly planning: PlanningService) {}

  private check(auth?: string, key?: string) {
    if (!integrationKeyOk(auth, key)) throw new UnauthorizedException(tr('errors.planning.integrationKey'));
  }

  @Get()
  @ApiOperation({ summary: 'OF abiertas a las que les falta material (Acopia)' })
  list(@Headers('authorization') auth?: string, @Headers('x-api-key') key?: string) {
    this.check(auth, key);
    return this.planning.ofsWithShortage();
  }

  @Get(':ref/materiales')
  @ApiOperation({ summary: 'Materiales de una OF y lo que falta tras reservar existencias (Acopia)' })
  materials(@Param('ref') ref: string, @Headers('authorization') auth?: string, @Headers('x-api-key') key?: string) {
    this.check(auth, key);
    return this.planning.ofMaterialsFor(ref);
  }
}
