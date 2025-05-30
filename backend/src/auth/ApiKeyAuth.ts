import { Request, Response, NextFunction, RequestHandler } from 'express';

export class ApiKeyAuth {
  private key = process.env.API_KEY;

  /** middleware для проверки x-api-key */
  get middleware(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        console.log('Incoming x-api-key:', req.header('x-api-key'));

      if (req.header('x-api-key') !== this.key) {
        // просто отправляем и выходим
        res.status(401).json({ error: 'Unauthorized' });
        return;  
      }
      next();
    };
  }
}
