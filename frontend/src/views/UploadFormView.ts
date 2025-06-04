/**
 * UploadFormView класс-обёртка над DOM-формой, которая
 * 1) передаёт callback, когда пользователь нажал Submit
 * 2) автоматически обновляет текст лейбла (Select file) при смене файла
 */
 export class UploadFormView {
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
     * onSubmit навешивает callback на сабмит (пользователь нажал Upload)
     * @param callback получает Event, сам может взять this.fileInput.files[0]
     */
    onSubmit(callback: (evt: Event) => void): void {
      this.form.addEventListener('submit', callback);
    }
  
    /**
     * Возвращает текущий выбранный файл или null
     */
    getSelectedFile(): File | null {
      return this.fileInput.files?.[0] ?? null;
    }
  }
  