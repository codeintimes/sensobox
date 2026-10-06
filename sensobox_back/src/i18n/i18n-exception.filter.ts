import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus, Logger, ValidationError } from '@nestjs/common';
import { Request, Response } from 'express';
import { resolveLang, t } from './i18n';

// Traduce todos los errores de la API al idioma de la petición (cabecera Accept-Language).
//  - Excepciones lanzadas con tr('errors.x'): se traduce su clave.
//  - Errores de validación (ValidationPipe con validationExceptionFactory): un mensaje por campo.
//  - Cualquier otro error HTTP o inesperado: texto genérico según el código.
@Catch()
export class I18nExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('I18nExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const lang = resolveLang(req.headers['accept-language']);
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body: any = exception instanceof HttpException ? exception.getResponse() : null;
    if (!(exception instanceof HttpException)) this.logger.error(exception instanceof Error ? exception.stack : String(exception));

    let messageKey: string;
    let message: string | string[];
    if (body && typeof body === 'object' && body.messageKey) {
      messageKey = body.messageKey;
      message = t(lang, messageKey, body.params);
    } else if (body && typeof body === 'object' && Array.isArray(body.validation)) {
      messageKey = 'errors.validation';
      message = body.validation.map((v: { field: string; constraint: string }) => {
        const key = `validation.${v.constraint}`;
        return t(lang, t(lang, key) === key ? 'validation.field' : key, { field: v.field });
      });
    } else {
      const generic = `errors.http.${status}`;
      messageKey = t(lang, generic) === generic ? 'errors.http.500' : generic;
      message = t(lang, messageKey);
    }
    if (res.headersSent) return;
    res.status(status).json({ statusCode: status, messageKey, message, error: t(lang, `errors.http.${status}`) });
  }
}

// Convierte los errores de class-validator en una lista {campo, regla} que el filtro traduce.
export const validationExceptionFactory = (errors: ValidationError[]) => {
  const flat: { field: string; constraint: string }[] = [];
  const walk = (list: ValidationError[], prefix = '') =>
    list.forEach((e) => {
      const field = prefix + e.property;
      Object.keys(e.constraints || {}).forEach((constraint) => flat.push({ field, constraint }));
      if (e.children?.length) walk(e.children, field + '.');
    });
  walk(errors);
  return new BadRequestException({ validation: flat });
};
