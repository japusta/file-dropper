import { Express, Request, Response, Router, NextFunction } from 'express';
import multer from 'multer';
import { S3Storage } from '../storage/S3Storage';
import { ApiKeyAuth } from '../auth/ApiKeyAuth';

export class FilesController {
  private router = Router();
  private upload = multer({ storage: multer.memoryStorage() });
  private auth = new ApiKeyAuth();

  constructor(private storage: S3Storage) {
    // bind выдаёт функцию правильного this
    this.router.post(
      '/upload',
      this.auth.middleware,
      this.upload.single('file'),
      this.uploadHandler.bind(this),
    );
    this.router.get(
      '/stats',
      this.auth.middleware,
      this.statsHandler.bind(this),
    );
  }

  register(app: Express): void {
    app.use('/api/files', this.router);
  }

  // теперь хэндлер отдаёт Promise<void>
  private async uploadHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    if (!req.file) {
      res.status(400).json({ error: 'No file' });
      return; // void
    }
    try {
      const key = await this.storage.save(req.file.buffer, req.file.mimetype);
      const url = await this.storage.generateLink(key);
      res.json({ url });
      return; // void
    } catch (err) {
      next(err); // передаём в ошибочный middleware
      return;
    }
  }

  private async statsHandler(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const stats = await this.storage.getStats();
      res.json(stats);
      return;
    } catch (err) {
      next(err);
      return;
    }
  }
}
