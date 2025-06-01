import { Express, Request, Response, NextFunction, Router } from 'express';
import multer from 'multer';
import { IStorage } from '../storage/IStorage';
import { IAuthMiddleware } from '../auth/IAuthMiddleware';

/**
 * FilesController — отвечает за маршруты:
 *   POST   /api/files/upload    загрузка файла
 *   GET    /api/files/stats     статистика
 * 
 * 
 *   storage    реализация IStorage
 *   auth       реализация IAuthMiddleware
 */
export class FilesController {
  private readonly router = Router();
  private readonly upload = multer({ storage: multer.memoryStorage() });

  /**
   * @param storage — экземпляр IStorage (например, SupabaseStorage)
   * @param auth    — экземпляр IAuthMiddleware (например, ApiKeyAuth)
   */
  constructor(
    private readonly storage: IStorage,
    private readonly auth: IAuthMiddleware
  ) {
    //  загрузка
    this.router.post(
      '/upload',
      //this.auth.middleware,            // проверка API-ключа
      this.upload.single('file'),      // multer: единственный файл под полем "file"
      this.uploadHandler.bind(this)
    );

    // статистика
    this.router.get(
      '/stats',
      //this.auth.middleware,
      this.statsHandler.bind(this)
    );
  }

  /** все маршруты на базовый путь /api/files */
  public register(app: Express): void {
    app.use('/api/files', this.router);
  }

  /** Обработчик POST /upload */
  private async uploadHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.file) {
      res.status(400).json({ error: 'No file' });
      return;
    }

    try {
      // 1) ссохраняем файл, получаем ключ
      const key = await this.storage.save(
        req.file.buffer,
        req.file.mimetype
      );
      // 2) генерируем подписанную ссылку
      const url = await this.storage.generateLink(key);
      // 3) возвращаем JSON { url }
      res.json({ url });
    } catch (err) {
      next(err);
    }
  }

  /** обработчик GET /stats */
  private async statsHandler(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await this.storage.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
}
