import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthCoreModule } from './modules/auth-core/auth-core.module';
import { ProxyModule } from './proxy/proxy.module';
import { TraceIdMiddleware } from './modules/middleware/traceId.middleware';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as yaml from 'yaml';

const env = process.env.NODE_ENV ?? 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: glob
        .sync(path.resolve(process.cwd(), `src/env/${env}/**/*.yml`))
        .map((filePath) => () => {
          const content = fs.readFileSync(filePath, 'utf8');
          return yaml.parse(content);
        }),
    }),
    ProxyModule,
    AuthCoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TraceIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
