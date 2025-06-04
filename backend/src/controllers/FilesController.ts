import { Express, Request, Response, NextFunction, Router } from 'express';
import multer, { MulterError } from 'multer';
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
  private readonly upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      // ограничение 100 МБ на файл
      fileSize: 100 * 1024 * 1024
    }
  });

  /**
   * @param storage — экземпляр IStorage (SupabaseStorage)
   * @param auth    — экземпляр IAuthMiddleware (ApiKeyAuth)
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
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    try {
      // 1) сохраняем файл, получаем ключ
      const key = await this.storage.save(
        req.file.buffer,
        req.file.mimetype
      );
      // 2) генерируем подписанную ссылку
      const url = await this.storage.generateLink(key);
      // 3) возвращаем JSON { url }
      res.json({ url });
    } catch (err: any) {
      // если это ошибка Multer (например, файл слишком большой)
      if (err instanceof MulterError) {
        // 413 Payload Too Large
        res.status(413).json({ error: err.message });
        return;
      }

      const msg = err?.message || 'Internal Server Error';
      if (msg.toLowerCase().includes('payload too large')) {
        res.status(413).json({ error: msg });
      } else if (msg.toLowerCase().includes('invalid part')) {
        res.status(400).json({ error: msg });
      } else {
        res.status(500).json({ error: msg });
      }
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
    } catch (err: any) {
      // отправляем понятную ошибку
      res.status(500).json({ error: err.message || 'Could not fetch stats' });
    }
  }
}
