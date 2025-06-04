import { IToastView } from './IToastView';

/**
 * ToastView показывает/прячет toast с анимацией opacity
 */
export class ToastView implements IToastView {
  constructor(private toastEl: HTMLElement) {}

  showMessage(msg: string): void {
    this.toastEl.textContent = msg;
    this.toastEl.hidden = false;
    this.toastEl.classList.add('show');
    // через 2 секунды скрываем
    setTimeout(() => {
      this.toastEl.classList.remove('show');
      setTimeout(() => (this.toastEl.hidden = true), 300);
    }, 2000);
  }
}
