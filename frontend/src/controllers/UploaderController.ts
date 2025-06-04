import { IFileService } from '../services/IFileService';
import { IProgressView } from '../views/IProgressView';
import { IModalView } from '../views/IModalView';
import { IToastView } from '../views/IToastView';
import { UploadFormView } from '../views/UploadFormView';

/**
 * UploaderController связывает все части вместе
 * 1) при сабмите: показывает прогресс, вызывает fileService.uploadFile(...)
 * 2) при успехе: скрывает прогресс, показывает ссылку, открывает модалку
 * 3) при ошибке: скрывает прогресс, показывает ошибку, выводит toast
 */
export class UploaderController {
  constructor(
    private fileService: IFileService,
    private progressView: IProgressView,
    private modalView: IModalView,
    private toastView: IToastView,
    private formView: UploadFormView,
    private statusEl: HTMLElement,
    private linkEl: HTMLElement,
    private statsEl: HTMLElement
  ) {
    // навешиваем обработчик сабмита
    this.formView.onSubmit((ev) => void this.handleSubmit(ev));
  }

  private async handleSubmit(evt: Event) {
    evt.preventDefault();

    const file = this.formView.getSelectedFile();
    if (!file) return;

    
    this.statusEl.textContent = 'Uploading...';
    this.linkEl.textContent = '';
    this.linkEl.style.color = '';
    this.statsEl.textContent = '';

    try {
      this.progressView.show();

      // запускаем upload и обновляем progress через колбэк
      const url = await this.fileService.uploadFile(
        file,
        (pct) => {
          this.progressView.setPercent(pct);
        }
      );

      this.progressView.hide();

      this.statusEl.textContent = 'Uploaded!';

      const a = document.createElement('a');
      a.href = url;
      a.textContent = 'Download file';
      a.style.cursor = 'pointer';
      this.linkEl.innerHTML = '';
      this.linkEl.appendChild(a);

      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.modalView.show(url);
      });

      const total = await this.fileService.getStats();
      this.statsEl.textContent = `Total quantity files: ${total}`;
    } catch (err: any) {
      //при ошибке: скрываем progress, выводим читаемое сообщение
      const message = err.message || 'Unknown error';
      this.statusEl.textContent = `Upload failed: ${message}`;
      // если нужно отдельно показать подчёркнутый текст
      // this.linkEl.textContent = message;
      this.linkEl.textContent = '';
      this.linkEl.style.color = 'red';

      this.progressView.hide();
      this.toastView.showMessage(message);
      console.error('Upload error:', err);
    }
  }
}
