import 'reflect-metadata';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

let server: express.Express | undefined;

async function getExpressServer(): Promise<express.Express> {
  if (server) return server;
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  });
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.init();
  server = expressApp;
  return server;
}

export function getApiHandler(): (req: express.Request, res: express.Response) => void {
  return (req, res) => {
    void getExpressServer()
      .then((s) => {
        s(req, res);
      })
      .catch((err: unknown) => {
        console.error(err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      });
  };
}
