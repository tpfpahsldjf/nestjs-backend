import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModule } from './account/account.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as yaml from 'yaml';
import { AdminModule } from './admin/admin.module';

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
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('urls.mongodb'),
      }),
    }),
    AuthModule,
    AccountModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
