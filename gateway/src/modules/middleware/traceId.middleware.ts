import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v7 as uuid } from 'uuid';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headerKey = 'x-trace-id';
    if (!req.headers[headerKey]) {
      req.headers[headerKey] = uuid();
    }

    res.setHeader(headerKey, req.headers[headerKey] as string);
    next();
  }
}
