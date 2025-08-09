import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TrimPipe } from './trim-pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };

  app.enableCors(options);
  app.useGlobalPipes(new TrimPipe());
  // app.enableCors({
  //   allowedHeaders: '*',
  //   origin: '*',
  // });

  const config = new DocumentBuilder()
    .setTitle('Small wins api')
    .setDescription('Small wins apis')
    .setVersion('1.0')
    .addTag('small-wins')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.APP_PORT || 5000);
}
bootstrap();
