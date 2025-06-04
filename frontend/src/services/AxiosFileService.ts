import axios, { type AxiosError, type AxiosProgressEvent } from 'axios';
import { IFileService } from './IFileService';

/**
 * AxiosFileService конкретная реализация IFileService через axios
 */
export class AxiosFileService implements IFileService {
  constructor(private baseUrl: string) {}

  async uploadFile(
    file: File,
    onProgress: (pct: number) => void
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e: AxiosProgressEvent) => {
        if (e.total !== undefined && e.loaded !== undefined) {
          const pct = Math.round((e.loaded * 100) / e.total);
          onProgress(pct);
        }
      },
    };

    try {
      const resp = await axios.post<{ url: string }>(
        `${this.baseUrl}/upload`,
        formData,
        config
      );
      return resp.data.url;
    } catch (err: unknown) {
      let errMsg = 'Upload failed';
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        // если backend вернул JSON вида { error: "some message" }, отдаём именно его:
        if ( axiosErr.response && axiosErr.response.data && typeof (axiosErr.response.data as any).error === 'string') {
          errMsg = (axiosErr.response.data as any).error;
        } else if (axiosErr.message) {
          // иначе  стандартное сообщение axios, например "Request failed with status code 413"
          errMsg = axiosErr.message;
        }
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      // ошибка  текстом
      throw new Error(errMsg);
    }
  }

  async getStats(): Promise<number> {
    try {
      const resp = await axios.get<{ total: number }>(
        `${this.baseUrl}/stats`
      );
      return resp.data.total;
    } catch (err: unknown) {
      let errMsg = 'Stats failed';
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        if (
          axiosErr.response &&
          axiosErr.response.data &&
          typeof (axiosErr.response.data as any).error === 'string'
        ) {
          errMsg = (axiosErr.response.data as any).error;
        } else if (axiosErr.message) {
          errMsg = axiosErr.message;
        }
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      throw new Error(errMsg);
    }
  }
}
