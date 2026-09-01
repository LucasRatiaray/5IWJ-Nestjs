import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { BusinessRuleViolationException } from '../exceptions/business-rule-violation.exception';

@Catch(BusinessRuleViolationException)
export class BusinessRuleViolationFilter implements ExceptionFilter {
  private readonly logger = new Logger('BusinessRule');

  catch(exception: BusinessRuleViolationException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.UNPROCESSABLE_ENTITY;

    this.logger.warn(
      `${request.method} ${request.originalUrl} ${status} - ${exception.message}`,
    );

    response.status(status).json({
      statusCode: status,
      error: 'Business Rule Violation',
      message: exception.message,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
}
