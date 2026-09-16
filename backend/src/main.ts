import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 启用 CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // 设置全局前缀
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`
╔══════════════════════════════════════════════════╗
║  🚀 电商智能运营中台 API 服务已启动              ║
╠══════════════════════════════════════════════════╣
║  服务地址: http://localhost:${port}                    ║
║  API 前缀: /${process.env.API_PREFIX || 'api/v1'}                          ║
║  环境模式: ${process.env.NODE_ENV || 'development'}                   ║
╠══════════════════════════════════════════════════╣
║  可用端点:                                        ║
║  POST   /${process.env.API_PREFIX || 'api/v1'}/auth/register            ║
║  POST   /${process.env.API_PREFIX || 'api/v1'}/auth/login               ║
║  GET    /${process.env.API_PREFIX || 'api/v1'}/auth/profile             ║
╚══════════════════════════════════════════════════╝
  `);
}
await bootstrap();
