import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const { method, originalUrl } = request;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        response.on('finish', () => {
          this.logger.log(
            `${method} ${originalUrl} ${response.statusCode} +${Date.now() - startedAt}ms`,
          );
        });
      }),
    );
  }
}
