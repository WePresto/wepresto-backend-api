import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

import { createdocument } from './swagger';

const ENVIRONMENTS_TO_SHOW_DOCS = ['local', 'development', 'staging'];

async function bootstrap() {
  // create nestjs app
  const app = await NestFactory.create(AppModule);

  // getting the config service
  const configService = app.get(ConfigService);

  // getting the port env var
  const PORT = configService.get<number>('config.app.port');

  // getting the environment var
  const ENV = configService.get<string>('config.environment');

  if (ENV && ENVIRONMENTS_TO_SHOW_DOCS.includes(ENV)) {
    SwaggerModule.setup('docs', app, createdocument(app));
  }

  app.enableCors();

  await app.listen(PORT, () => {
    Logger.log(`app listening at ${PORT} in ${ENV}.`, 'main.ts');
  });
}

bootstrap();
