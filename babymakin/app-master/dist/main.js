"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const trim_pipe_1 = require("./trim-pipe");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const options = {
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
    };
    app.enableCors(options);
    app.useGlobalPipes(new trim_pipe_1.TrimPipe());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Small wins api')
        .setDescription('Small wins apis')
        .setVersion('1.0')
        .addTag('small-wins')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(process.env.APP_PORT || 5000);
}
bootstrap();
//# sourceMappingURL=main.js.map