import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { plainToInstance } from 'class-transformer';

interface ClassConstructor<T = any> {
  new (...args: any[]): T;
}

export function TransformResponse<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new TransformResponseInterceptor(dto));
}

export class TransformResponseInterceptor<T> implements NestInterceptor {
  private readonly logger = new Logger(TransformResponseInterceptor.name);
  constructor(private readonly dto: ClassConstructor<T>) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<T | T[]> {
    return next.handle().pipe(
      map((data: unknown): T | T[] => {
        try {
          return plainToInstance(this.dto, data, {
            excludeExtraneousValues: true,
          });
        } catch (err) {
          const req = context.switchToHttp().getRequest();
          this.logger.error(
            `Failed to transform response for ${req.method} ${req.url}`,
            err,
          );
          throw new InternalServerErrorException(
            'Response transformation failed',
          );
        }
      }),
    );
  }
}