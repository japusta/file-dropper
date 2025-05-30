import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SupabaseStorage } from './storage/SupabaseStorage';
import { FilesController } from './controllers/FilesController';

dotenv.config();

export class App {
  public expressApp: Express;
  private storage = new SupabaseStorage();

  constructor() {
    this.expressApp = express();
    this.setupMiddleware();
    this.setupHealthCheck();
    new FilesController(this.storage).register(this.expressApp);

    // Обработчик ошибок
    this.expressApp.use(
      (err: any, _req: Request, res: Response, _next: NextFunction) => {
        console.error('Controller Error:', err);
        res
          .status(err.status || 500)
          .json({ error: err.message || 'Internal Server Error' });
      },
    );
  }

  private setupMiddleware(): void {
    this.expressApp.use(cors());
    this.expressApp.use(express.json());
  }

  /** проверка что сервер жив */
  private setupHealthCheck(): void {
    this.expressApp.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({ status: 'ok' });
    });
  }

  public start(): void {
    const port = process.env.PORT || 3000;
    this.expressApp.listen(port, () =>
      console.log(`Listening on http://localhost:${port}`),
    );
  }
}
