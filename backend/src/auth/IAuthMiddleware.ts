import { RequestHandler } from 'express';

/**
 * абстракция для любого middleware аутентификации и/или авторизации
 */
export interface IAuthMiddleware {
  /**
   * dозвращает Express-совместимый middleware
   * (req, res, next) => { ... }
   */
  readonly middleware: RequestHandler;
}
