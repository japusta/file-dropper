// backend/src/storage/SupabaseStorage.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IStorage } from './IStorage';
import { v4 as uuidv4 } from 'uuid';

/**
 * SupabaseStorage  конкретная реализация IStorage на базе Supabase
 * 
 * Переменные окружения которые должны быть в .env
 *   SUPABASE_URL    (например https://xyz.supabase.co)
 *   SUPABASE_KEY    (секретный ключ)
 *   SUPABASE_BUCKET (имя бакета, например "files")
 */
export class SupabaseStorage implements IStorage {
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    if (
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_KEY ||
      !process.env.SUPABASE_BUCKET
    ) {
      throw new Error('Не заданы SUPABASE_URL, SUPABASE_KEY или SUPABASE_BUCKET в .env');
    }

    this.client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    this.bucket = process.env.SUPABASE_BUCKET;
  }

  async save(buffer: Buffer, mime: string): Promise<string> {
    const fileName = uuidv4();
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(fileName, buffer, { contentType: mime });

    if (error) {
      // Если ошибка (например, «Payload too large» или другая),
      // выбрасываем её дальше, чтобы FilesController вернул код 500 и текст ошибки
      throw error;
    }
    return fileName;
  }

  async generateLink(key: string, expiresInSec = 3600): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(key, expiresInSec);

    if (error) {
      throw error;
    }
    if (!data?.signedUrl) {
      throw new Error('Не удалось вернуть подписанную ссылку.');
    }
    return data.signedUrl;
  }

  async getStats(): Promise<{ total: number }> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .list();

    if (error) {
      throw error;
    }
    return { total: data.length };
  }

  async purgeOldFiles(days: number): Promise<number> {
    // вычислим timestamp (в мс) минимальной даты
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    // получим полный список объектов (максимум 1000) отсортированных по created_at
    const { data: objects, error } = await this.client.storage
      .from(this.bucket)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      });

    if (error) {
      throw error;
    }

    let deletedCount = 0;
    for (const obj of objects ?? []) {
      // Supabase отдаёт created_at в ISO-формате (строка)
      const createdTs = new Date(obj.created_at!).getTime();
      if (createdTs < cutoff) {
        const { error: delErr } = await this.client.storage
          .from(this.bucket)
          .remove([obj.name]);
        if (delErr) {
          console.warn('Не удалось удалить файл:', obj.name, delErr);
        } else {
          deletedCount++;
        }
      } else {
        // поскольку список отсортирован «asc», дальше уже все даты будут > cutoff
        break;
      }
    }
    return deletedCount;
  }
}
