/*
 * описывает абстракцию слоя хранения файлов
 * 
 * 
 *  1 save(buffer, mime)      сохранить, вернуть уникальный ключ (string)
 *  2 generateLink(key, exp)  сгенерировать ссылку (signed URL)
 *  3 getStats()              вернуть { total: number }
 *  4 purgeOldFiles(days)     удалить файлы старше days, вернуть сколько удалено
 */
 export interface IStorage {
    /*
     * сохраняет буфер (file buffer) с указанным MIME-типом
     * возвращает строковый ключ (например, uuid) для этого файла
     */
    save(buffer: Buffer, mime: string): Promise<string>;
  
    /*
     * генерирует подписанную ссылку для скачивания по ключу
     * expiresInSec время жизни ссылки в секундах (по умолчанию 3600)
     */
    generateLink(key: string, expiresInSec?: number): Promise<string>;
  
    /*
     * получает статистику по текущему количеству файлов
     * взвращает объект { total: число файлов }
     */
    getStats(): Promise<{ total: number }>;
  
    /*
     * удаляет все файлы старше указанного количества дней
     * возвращает общее число удалённых файлов
     */
    purgeOldFiles(days: number): Promise<number>;
  }
  