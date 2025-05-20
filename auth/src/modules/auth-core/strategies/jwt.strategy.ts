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
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        ...jwkConfig,
        handleSigningKeyError: (err, cb) => {
          if (err instanceof jwksRsa.SigningKeyNotFoundError) {
            return cb(new Error('This is bad'));
          }

          return cb(err);
        }
      }),
      ...jwtConfig
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid JWT payload');
    }
    return payload;
  }
}
