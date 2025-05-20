import http from 'http';

export interface ProxyRequest extends http.IncomingMessage {
  proxyHost?: string;
}