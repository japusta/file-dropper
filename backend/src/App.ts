import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { IStorage } from './storage/IStorage';
import { SupabaseStorage } from './storage/SupabaseStorage';
import { IAuthMiddleware } from './auth/IAuthMiddleware';
import { ApiKeyAuth } from './auth/ApiKeyAuth';
import { FilesController } from './controllers/FilesController';

dotenv.config();

export class App {
  public expressApp: Express;
  private readonly storage: IStorage;
  private readonly auth: IAuthMiddleware;

  constructor() {
    this.expressApp = express();

    // выбираем какую реализацию IStorage использовать (здесь Supabase)
    this.storage = new SupabaseStorage();

    // выбираем какую реализацию IAuthMiddleware использовать (ApiKeyAuth)
    this.auth = new ApiKeyAuth();

    this.setupMiddleware();
    this.setupHealthCheck();

    // регистрируем контроллер затем передаём storage и auth
    new FilesController(this.storage, this.auth).register(this.expressApp);

    // периодическая задача очистки
    cron.schedule('0 0 * * *', async () => {
      try {
        const deletedCount = await this.storage.purgeOldFiles(30);
        console.log(`🗑 Purged ${deletedCount} old files`);
      } catch (e) {
        console.error('Ошибка при purgeOldFiles:', e);
      }
    });

    // обработчик ошибок 
    this.expressApp.use((
      err: any,
      _req: Request,
      res: Response,
      _next: NextFunction
    ) => {
      console.error('Controller Error:', err);
      res
        .status(err.status || 500)
        .json({ error: err.message || 'Internal Server Error' });
    });
  }

  private setupMiddleware(): void {
    // CORS, JSON-body парсинг
    this.expressApp.use(cors());
    this.expressApp.use(express.json());
  }

  private setupHealthCheck(): void {
    this.expressApp.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({ status: 'ok' });
    });
  }

  public start(): void {
    const port = process.env.PORT || 3000;
    this.expressApp.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`);
    });
  }
}
