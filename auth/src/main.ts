import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ErrorCode } from './common/enums/error-code.enum';
import { JwkService } from './auth/token/jwk.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const messages = errors
          .map((error) => Object.values(error.constraints ?? {}))
          .flat()
          .join(', ');

        return new BadRequestException({
          message: messages,
          error: ErrorCode.INVALID_ARGUMENT,
          statusCode: 400});
      },
    }),
  );

  const jwk = app.get(JwkService);
  await jwk.initialize();

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('인증 서버 Swagger 문서')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
