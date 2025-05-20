import { TokenProvider } from './token.provider';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../modules/auth-core/types/jwt-payload.interface';
import { JwkService } from './jwk.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtTokenService implements TokenProvider {
  private readonly logger = new Logger(JwtTokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly jwkService: JwkService,
    private readonly configService: ConfigService,
  ) {}

  verify(token: string) {
    const decoded: JwtPayload = this.jwtService.verify(token, {
      algorithms:this.jwkService.publicJwk.alg,
      publicKey: this.jwkService.publicKey,
    });

    return decoded;
  }

  sign(payload: any): string {
    const jwt = this.jwtService.sign(payload, {
      algorithm: this.jwkService.publicJwk.alg,
      privateKey: this.jwkService.privateKey,
      keyid: this.jwkService.publicJwk.kid,
      issuer: this.configService.getOrThrow<string>('jwt.issuer'),
      audience: this.configService.getOrThrow<string>('jwt.audience'),
      expiresIn: this.configService.get<string>('jwt.expiresIn', '2h'),
    });

    return jwt;
  }
}
