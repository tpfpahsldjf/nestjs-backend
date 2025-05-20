import { All, Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy.service';
import { JwtAuthGuard } from '../../modules/auth-core/guard/jwt.auth.guard';
import { ConfigService } from '@nestjs/config';
import { RolesGuard } from '../../commom/guards/roles.guard';
import { Roles } from '../../commom/decorator/roles.decorator';
import { UserRole } from '../../commom/user.role.enum';

@Controller('auth')
@UseGuards(RolesGuard)
export class AuthProxyController {
  readonly logger = new Logger(AuthProxyController.name);
  private readonly targetHost: string;
  private readonly prefix = 'auth';
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {
    this.targetHost = this.configService.get<string>(`urls.${this.prefix}`)!;
  }

  @Get('jwk')
  publicProxyGet(@Req() request: Request, @Res() response: Response) {
    return this.proxyService.forward(
      request,
      response,
      this.targetHost,
      this.prefix,
    );
  }

  @Post(['signin', 'signup'])
  publicPostProxyPost(@Req() request: Request, @Res() response: Response) {
    return this.proxyService.forward(
      request,
      response,
      this.targetHost,
      this.prefix,
    );
  }

  @All('admin/*path')
  // @UseGuards(JwtAuthGuard)
  // @Roles(UserRole.ADMIN)
  // 초반 테스트시 Admin계정이 없기때문에 테스트를위해 임시로 public로 열어둔다
  // 추후 위의 룰을 설정한다.
  privateRolseProxy(@Req() request: Request, @Res() response: Response) {
    return this.proxyService.forward(
      request,
      response,
      this.targetHost,
      this.prefix,
    );
  }

  @All('*path')
  @UseGuards(JwtAuthGuard)
  privateProxy(@Req() request: Request, @Res() response: Response) {
    return this.proxyService.forward(
      request,
      response,
      this.targetHost,
      this.prefix,
    );
  }
}
