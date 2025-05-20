import { Module } from '@nestjs/common';
import { AuthProxyController } from './controllers/auth-proxy.controller';
import { ProxyService } from './proxy.service';
import { HttpModule } from '@nestjs/axios';
import { AuthCoreModule } from '../modules/auth-core/auth-core.module';
import { EventProxyController } from './controllers/event-proxy.controller';

@Module({
  imports: [HttpModule, AuthCoreModule],
  controllers: [AuthProxyController, EventProxyController],
  providers: [ProxyService]
})
export class ProxyModule {}
