// src/auth/ApiKeyAuth.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

export class ApiKeyAuth {
  private key = process.env.API_KEY;

  /** Express middleware для проверки x-api-key */
  get middleware(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (req.header('x-api-key') !== this.key) {
        // просто отправляем и выходим
        res.status(401).json({ error: 'Unauthorized' });
        return;  // void
      }
      next();
    };
  }
}
