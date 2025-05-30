import { Express, Request, Response, Router, NextFunction } from 'express';
import multer from 'multer';
import { SupabaseStorage } from '../storage/SupabaseStorage';
import { ApiKeyAuth } from '../auth/ApiKeyAuth';

export class FilesController {
  private router = Router();
  private upload = multer({ storage: multer.memoryStorage() });
  private auth = new ApiKeyAuth();

  constructor(private storage: SupabaseStorage) {
    // bind выдаёт функцию правильного this
    this.router.post(
      '/upload',
      //this.auth.middleware,
      this.upload.single('file'),
      this.uploadHandler.bind(this),
    );
    this.router.get(
      '/stats',
      //this.auth.middleware,
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
      return; 
    }
    try {
      const key = await this.storage.save(req.file.buffer, req.file.mimetype);
      const url = await this.storage.generateLink(key);
      res.json({ url });
      return; 
    } catch (err) {
      next(err); 
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
