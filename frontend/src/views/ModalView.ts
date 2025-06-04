import { IModalView } from './IModalView';

/**
 * ModalView конкретная реализация, которая
 * манипулирует классом .active у modal-контейнера
 * и навешивает клики на downloadBtn, copyBtn, closeBtn
 */
export class ModalView implements IModalView {
  constructor(
    private modalEl: HTMLElement,
    private downloadBtn: HTMLElement,
    private copyBtn: HTMLElement,
    private closeBtn: HTMLElement,
    private toastFn: (msg: string) => void // callback, чтобы при копировании показать toast
  ) {
    this.closeBtn.addEventListener('click', () => this.hide());
  }

  show(url: string): void {
    this.modalEl.classList.add('active');

    // навешиваем обработчики 
    this.downloadBtn.onclick = () => {
      window.open(url, '_blank');
      this.hide();
    };
    this.copyBtn.onclick = () => {
      navigator.clipboard.writeText(url)
        .then(() => this.toastFn('Ссылка скопирована'))
        .catch(() => this.toastFn('Ошибка копирования'));
      this.hide();
    };
  }

  hide(): void {
    this.modalEl.classList.remove('active');
    this.downloadBtn.onclick = null;
    this.copyBtn.onclick = null;
  }
}
