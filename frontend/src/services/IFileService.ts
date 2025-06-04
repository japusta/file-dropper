/**
 * IFileService абстракция для сервиса файлов (загрузка и статистика)
 */
 export interface IFileService {
    /**
     * uploadFile
     * @param file объект File из <input type="file">
     * @param onProgress колбэк, чтобы сообщать процент загрузки (0–100)
     * @returns Promise<string> с URL загруженного файла
     */
    uploadFile(
      file: File,
      onProgress: (pct: number) => void
    ): Promise<string>;
  
    /**
     * getStats возвращает текущее количество успешно загруженных файлов
     */
    getStats(): Promise<number>;
  }
  