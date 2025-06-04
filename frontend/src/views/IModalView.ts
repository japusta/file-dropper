/**
 * IModalView интерфейс для модалки скачивания/копирования
 */
 export interface IModalView {
    /**
     * show показать окно с данным URL
     * @param url ссылка на загруженный файл
     */
    show(url: string): void;
  
    /** hide скрыть окно */
    hide(): void;
  }
  