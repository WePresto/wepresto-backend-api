import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function createdocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('WePresto-API')
    .setDescription('API for WePresto')
    .setVersion('1.0')
    .addServer(`http://localhost:${process.env.PORT}`, 'Local')
    .addServer(
      'https://wepresto-backend-api-development.up.railway.app/',
      'Development',
    )
    .addBearerAuth({ bearerFormat: 'JWT', type: 'http' })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  return document;
}
