import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export class S3Storage {
  private client = new S3Client({ region: process.env.S3_REGION });
  private bucket = process.env.S3_BUCKET!;

  async save(buffer: Buffer, mimeType: string): Promise<string> {
    const key = uuidv4();
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: mimeType }),
    );
    return key;
  }

  async generateLink(key: string, expiresInSec = 3600): Promise<string> {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, cmd, { expiresIn: expiresInSec });
  }

  async getStats(): Promise<{ total: number }> {
    const list = await this.client.send(new ListObjectsV2Command({ Bucket: this.bucket }));
    return { total: list.KeyCount ?? 0 };
  }
}
