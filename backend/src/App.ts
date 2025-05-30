// backend/src/App.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { S3Storage } from './storage/S3Storage';
import { FilesController } from './controllers/FilesController';

dotenv.config();

export class App {
  public expressApp: Express;
  private storage = new S3Storage();

  constructor() {
    this.expressApp = express();
    this.setupMiddleware();
    this.setupHealthCheck();
    new FilesController(this.storage).register(this.expressApp);
  }

  private setupMiddleware(): void {
    this.expressApp.use(cors());
    this.expressApp.use(express.json());
  }

  /** Простая проверка, что сервер жив */
  private setupHealthCheck(): void {
    this.expressApp.get(
      '/health',
      (req: Request, res: Response) => {
        res.status(200).json({ status: 'ok' });
      },
    );
  }

  public start(): void {
    const port = process.env.PORT || 3000;
    this.expressApp.listen(port, () =>
      console.log(`🚀 Listening on http://localhost:${port}`),
    );
  }
}
