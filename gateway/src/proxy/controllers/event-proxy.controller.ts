import { All, Controller, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../modules/auth-core/guard/jwt.auth.guard';
import { RolesGuard } from '../../commom/guards/roles.guard';
import { Roles } from '../../commom/decorator/roles.decorator';
import { UserRole } from '../../commom/user.role.enum';

@Controller('event')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventProxyController {
  readonly logger = new Logger(EventProxyController.name);
  private readonly targetHost: string;
  private readonly prefix = 'event';
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {
    this.targetHost = this.configService.get<string>(`urls.${this.prefix}`)!;
  }

  @All('admin/*path')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.AUDITOR)
  async adminProxy(@Req() request: Request, @Res() response: Response) {
    return this.proxyService.forward(
      request,
      response,
      this.targetHost,
      this.prefix,
    );
  }

  @All('*path')
  async privateProxy(@Req() request: Request, @Res() response: Response) {
    return this.proxyService.forward(
      request,
      response,
      this.targetHost,
      this.prefix,
    );
  }
}
