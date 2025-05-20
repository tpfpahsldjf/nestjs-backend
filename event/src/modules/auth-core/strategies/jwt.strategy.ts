import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as jwksRsa from 'jwks-rsa';
import { JwtPayload } from '../types/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    const jwtConfig = configService.getOrThrow('jwt');
    const jwkConfig = configService.getOrThrow('jwk');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.passportJwtSecret(jwkConfig),
      ...jwtConfig,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload || !payload.sub) {
      console.log(payload);
      throw new UnauthorizedException('Insvalid JWT payload');
    }
    return payload;
  }
}
