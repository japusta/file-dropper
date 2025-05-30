import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseStorage {
  private client: SupabaseClient;
  private bucket: string;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
    this.bucket = process.env.SUPABASE_BUCKET!;
  }

  async save(buffer: Buffer, mime: string): Promise<string> {
    const fileName = uuidv4();
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(fileName, buffer, { contentType: mime });
    if (error) throw error;
    return fileName;
  }

  async generateLink(key: string, expiresInSec = 3600): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(key, expiresInSec);
    if (error) throw error;
    if (!data?.signedUrl) throw new Error('Signed URL not returned');
    return data.signedUrl;
  }

  async getStats(): Promise<{ total: number }> {
    const { data, error } = await this.client.storage.from(this.bucket).list();
    if (error) throw error;
    return { total: data.length };
  }
}
