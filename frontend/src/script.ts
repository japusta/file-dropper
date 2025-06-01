import axios from 'axios';

/**
 * IFileService — абстракция для сервиса файлов (загрузка и статистика)
 */
interface IFileService {
  uploadFile(
    file: File,
    onProgress: (pct: number) => void
  ): Promise<string>;
  getStats(): Promise<number>;
}

/**
 * AxiosFileService — конкретная реализация IFileService через axios
 */
class AxiosFileService implements IFileService {
  constructor(private baseUrl: string) {}

  async uploadFile(
    file: File,
    onProgress: (pct: number) => void
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e: ProgressEvent) => {
        if (e.total) {
          const pct = Math.round((e.loaded * 100) / e.total);
          onProgress(pct);
        }
      },
    };

    const resp = await axios.post<{ url: string }>(
      `${this.baseUrl}/upload`,
      formData,
      config
    );
    return resp.data.url;
  }

  async getStats(): Promise<number> {
    const resp = await axios.get<{ total: number }>(
      `${this.baseUrl}/stats`
    );
    return resp.data.total;
  }
}

/**
 * IProgressView — интерфейс для UI-слоя, показывающего прогресс-бар
 */
interface IProgressView {
  show(): void;                 // показать контейнер
  hide(): void;                 // скрыть контейнер
  setPercent(pct: number): void; // обновить ширину полосы
}

/**
 * ProgressView — конкретная реализация через два элемента: контейнер и полоса
 */
class ProgressView implements IProgressView {
  constructor(
    private container: HTMLElement,
    private bar: HTMLElement
  ) {}

  show(): void {
    this.container.hidden = false;
    this.bar.style.width = '0%';
  }

  hide(): void {
    this.container.hidden = true;
  }

  setPercent(pct: number): void {
    this.bar.style.width = `${pct}%`;
  }
}

/**
 * IModalView — интерфейс для модалки скачивания/копирования.
 */
interface IModalView {
  show(url: string): void;  // показать окно с данным URL
  hide(): void;             // скрыть окно
}

/**
 * ModalView — конкретная реализация, которая
 * манипулирует классом .active у modal-контейнера
 * и навешивает клики на downloadBtn, copyBtn, closeBtn.
 */
class ModalView implements IModalView {
  constructor(
    private modalEl: HTMLElement,
    private downloadBtn: HTMLElement,
    private copyBtn: HTMLElement,
    private closeBtn: HTMLElement,
    private toastFn: (msg: string) => void // callback чтобы при копировании показать toast
  ) {
    this.closeBtn.addEventListener('click', () => this.hide());
  }

  show(url: string): void {
    this.modalEl.classList.add('active');

    // при каждом новом показе навешиваем обработчики:
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

/**
 * IToastView — интерфейс для toast уведомлений.
 */
interface IToastView {
  showMessage(msg: string): void;
}

/**
 * ToastView — показывает/прячет div#toast с анимацией opacity
 */
class ToastView implements IToastView {
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

/**
 * UploadFormView — класс-обёртка над DOM-формой, которая
 * 1) передаёт callback, когда пользователь нажал Submit
 * 2) автоматически обновляет текст лейбла (Select file) при смене файла
 */
class UploadFormView {
  private fileInput: HTMLInputElement;
  private fileLabel: HTMLElement;
  private form: HTMLFormElement;

  constructor(
    formId: string,
    fileInputId: string,
    fileLabelId: string
  ) {
    this.form = document.getElementById(formId) as HTMLFormElement;
    this.fileInput = document.getElementById(fileInputId) as HTMLInputElement;
    this.fileLabel = document.getElementById(fileLabelId)!;

    this.fileInput.addEventListener('change', () => {
      this.fileLabel.textContent =
        this.fileInput.files?.[0]?.name || 'Select file';
    });
  }

  /**
   * навешивает callback на сабмит (пользователь нажал Upload)
   * callback получает Event и сам может взять this.fileInput.files[0].
   */
  onSubmit(callback: (evt: Event) => void): void {
    this.form.addEventListener('submit', callback);
  }

  getSelectedFile(): File | null {
    return this.fileInput.files?.[0] ?? null;
  }
}

/**
 * 
 * сама бизнес-логика "пользователь нажал Upload => загрузить => показать результат"
 */
class UploaderController {
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

    // сброс UI
    this.statusEl.textContent = 'Uploading…';
    this.linkEl.textContent = '';
    this.statsEl.textContent = '';

    try {
      // запускаем показ progress-бара
      this.progressView.show();

      // Загружаем файл, обновляя progress через коллбэк
      const url = await this.fileService.uploadFile(
        file,
        (pct) => {
          this.progressView.setPercent(pct);
        }
      );

      // cкрываем progress-бар
      this.progressView.hide();

      this.statusEl.textContent = 'Uploaded!';

      // формируем ссылку в DOM
      const a = document.createElement('a');
      a.href = url;
      a.textContent = 'Download file';
      a.style.cursor = 'pointer';
      this.linkEl.innerHTML = '';
      this.linkEl.appendChild(a);

      // При клике — открываем modalView
      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.modalView.show(url);
      });

      // получаем статистику и выводим
      const total = await this.fileService.getStats();
      this.statsEl.textContent = `Total quantity files: ${total}`;
    } catch (err: any) {
      this.statusEl.textContent = 'Error';
      console.error(err);
      this.progressView.hide();
      this.toastView.showMessage('Error loading');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 1) инициализация конкретной реализации «сервиса файлов»
  const fileService = new AxiosFileService('http://localhost:3000/api/files');

  // 2) инициализация реализации progress-view
  const progressContainer = document.getElementById('progressContainer')!;
  const progressBar       = document.getElementById('progressBar')!;
  const progressView = new ProgressView(progressContainer, progressBar);

  // 3) инициализация toast-view
  const toastEl = document.getElementById('toast')!;
  const toastView = new ToastView(toastEl);

  // 4) инициализация modal-view, передаём callback внутри (toast при копировании)
  const modalEl     = document.getElementById('choiceModal')!;
  const downloadBtn = document.getElementById('downloadBtn')!;
  const copyBtn     = document.getElementById('copyBtn')!;
  const closeBtn    = document.getElementById('closeBtn')!;
  const modalView = new ModalView(
    modalEl,
    downloadBtn,
    copyBtn,
    closeBtn,
    (message) => toastView.showMessage(message)
  );

  // 5) инициализация обёртки над формой
  const formView = new UploadFormView(
    'uploadForm',  // id формы
    'fileInput',   // id <input type="file">
    'fileLabel'    // id <span> внутри
  );

  // 6) DOM-элементы для статус ссылки и статистики
  const statusEl = document.getElementById('status')!;
  const linkEl   = document.getElementById('link')!;
  const statsEl  = document.getElementById('stats')!;

  // 7) Создаём контроллер
  new UploaderController(
    fileService,
    progressView,
    modalView,
    toastView,
    formView,
    statusEl,
    linkEl,
    statsEl
  );
});
