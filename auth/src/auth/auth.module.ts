import { Module } from '@nestjs/common';
import { JwkController } from './token/jwk.controller';
import { TOKEN_PROVIDER } from './token/token.provider';
import { JwtTokenService } from './token/jwt.token.service';
import { JwtModule } from '@nestjs/jwt';
import { JwkService } from './token/jwk.service';
import { JwtStrategy } from '../modules/auth-core/strategies/jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { JwkSchema, JwkSchemaClass } from './token/jwk.schema';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: JwkSchemaClass.name, schema: JwkSchema },
    ]),
  ],
  exports: [TOKEN_PROVIDER, JwkService, JwtModule],
  controllers: [JwkController],
  providers: [
    JwkService,
    {
      provide: TOKEN_PROVIDER,
      useClass: JwtTokenService,
    },
    JwtStrategy,
  ],
})
export class AuthModule {}
