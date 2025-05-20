import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

export interface ProxyLifecycleHandler {
  onRequest(req: IncomingMessage, res: ServerResponse): void;
  onResponse(req: IncomingMessage, res: ServerResponse): void;
  onError(
    error: Error,
    req: IncomingMessage,
    res: ServerResponse | Socket,
  ): void;
}
