import { Request, Response, NextFunction, RequestHandler } from 'express';
import { IAuthMiddleware } from './IAuthMiddleware';

/**
 * ApiKeyAuth  проверяет что заголовок `x-api-key` совпадает
 * с переменной окружения API_KEY. Реализует IAuthMiddleware
 */
export class ApiKeyAuth implements IAuthMiddleware {
  private readonly key: string | undefined = process.env.API_KEY;

  /**
   * Возвращает сам middleware Handler. В нём проверяем:
   *   req.header('x-api-key') === this.key
   * Если нет — отправляем 401, иначе — вызываем next().
   */
  public get middleware(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      console.log('Incoming x-api-key:', req.header('x-api-key'));

      if (!this.key || req.header('x-api-key') !== this.key) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      next();
    };
  }
}
