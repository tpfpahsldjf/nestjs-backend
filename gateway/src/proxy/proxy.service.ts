import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { URL } from 'url';
import { Method } from 'axios';

@Injectable()
export class ProxyService {

  readonly BLACKLIST = new Set([
    'content-length',
    'accept-encoding',
    'cache-control',
    'postman-token',
  ]);

  constructor(private readonly httpService: HttpService) {}

  async forward(
    req: Request,
    res: Response,
    targetHost: string,
    prefix: string,
  ): Promise<void> {
    const fullPath = req.originalUrl;
    const base = `/${prefix}`;
    const path = fullPath.startsWith(base)
      ? fullPath.substring(base.length)
      : fullPath;
    const url = `${targetHost}${path}`;

    const headers: Record<string, any> = {};
    for (const key in req.headers) {
      const val = req.headers[key];
      if (val != null && !this.BLACKLIST.has(key)) {
        headers[key] = val;
      }
    }

    headers.host = new URL(targetHost).host;

    const axiosRes = await firstValueFrom(
      this.httpService.request({
        url,
        method: req.method as Method,
        headers,
        data: req.body,
        validateStatus: () => true,
      }),
    );

    res
      .status(axiosRes.status)
      .set(axiosRes.headers as Record<string, string | string[]>)
      .send(axiosRes.data);
  }
}