// frontend/src/script.ts
class Uploader {
  constructor(
    private apiBase: string,
    private statusEl: HTMLElement,
    private linkEl: HTMLElement,
    private statsEl: HTMLElement
  ) {}

  async upload(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const resp = await fetch(`${this.apiBase}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || `Upload failed: ${resp.status}`);
    }
    return resp.json();
  }

  async fetchStats(): Promise<{ total: number }> {
    const resp = await fetch(`${this.apiBase}/stats`);
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || `Stats failed: ${resp.status}`);
    }
    return resp.json();
  }

  async handleSubmit(evt: Event): Promise<void> {
    evt.preventDefault();
    const input = document.getElementById('fileInput') as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.statusEl.textContent = 'Uploading…';
    this.linkEl.textContent = '';
    this.statsEl.textContent = '';

    try {
      const { url } = await this.upload(file);
      this.statusEl.textContent = 'Uploaded!';
      this.linkEl.innerHTML = `<a href="${url}" target="_blank">Download file</a>`;

      const { total } = await this.fetchStats();
      this.statsEl.textContent = `Total files: ${total}`;
    } catch (err: any) {
      this.statusEl.textContent = 'Error';
      console.error(err);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const apiBase = 'http://localhost:3000/api/files'; 
  const uploader = new Uploader(
    apiBase,
    document.getElementById('status')!,
    document.getElementById('link')!,
    document.getElementById('stats')!
  );
  document
    .getElementById('uploadForm')!
    .addEventListener('submit', (e) => void uploader.handleSubmit(e));
});
