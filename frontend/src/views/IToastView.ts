/**
 * IToastView интерфейс для toast-уведомлений
 */
 export interface IToastView {
    /** Показывает сообщение и прячет его через 2 секунды */
    showMessage(msg: string): void;
  }
  