import { Controller, Get } from '@nestjs/common';
import { JwkService } from './jwk.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';


@Controller('jwk')
export class JwkController {
  constructor(private readonly jwkService: JwkService) {}

  @Get('')
  @ApiOperation({
    summary: '공개 JWK 키 목록 반환',
    description:
      '외부 서비스에서 JWT 서명 검증에 사용할 공개 키 목록(JWK Set)을 반환합니다.',
  })
  @ApiOkResponse({
    description: 'JWK 공개 키 세트',
    schema: {
      type: 'object',
      properties: {
        keys: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              kty: { type: 'string', example: 'RSA' },
              kid: { type: 'string', example: 'abcd-1234-efgh-5678' },
              use: { type: 'string', example: 'sig' },
              alg: { type: 'string', example: 'RS256' },
              n: { type: 'string', example: '...' },
              e: { type: 'string', example: 'AQAB' },
            },
          },
        },
      },
    },
  })
  certs(): Record<string, unknown> {
    return {
      keys: [this.jwkService.publicJwk],
    };
  }
}
