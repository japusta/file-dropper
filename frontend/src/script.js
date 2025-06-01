var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// frontend/src/script.ts
import axios from 'axios';
class Uploader {
    constructor(apiBase, statusEl, linkEl, statsEl, progressContainer, progressBar) {
        this.apiBase = apiBase;
        this.statusEl = statusEl;
        this.linkEl = linkEl;
        this.statsEl = statsEl;
        this.progressContainer = progressContainer;
        this.progressBar = progressBar;
    }
    /** Загружает файл с индикатором прогресса и возвращает URL */
    upload(file) {
        return __awaiter(this, void 0, void 0, function* () {
            // Сброс и показ прогресс-бара
            this.progressBar.style.width = '0%';
            this.progressContainer.hidden = false;
            const formData = new FormData();
            formData.append('file', file);
            // Без явного типа — TS сам поймёт, что это AxiosRequestConfig
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    if (e.total) {
                        const pct = Math.round((e.loaded * 100) / e.total);
                        this.progressBar.style.width = `${pct}%`;
                    }
                },
            };
            const response = yield axios.post(`${this.apiBase}/upload`, formData, config);
            // Скрываем индикатор и отдаём URL
            this.progressContainer.hidden = true;
            return response.data.url;
        });
    }
    /** Получает статистику по количеству файлов */
    fetchStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios.get(`${this.apiBase}/stats`);
            return response.data.total;
        });
    }
    /** Обработка сабмита формы */
    handleSubmit(evt) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            evt.preventDefault();
            const input = document.getElementById('fileInput');
            const file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return;
            this.statusEl.textContent = 'Uploading…';
            this.linkEl.textContent = '';
            this.statsEl.textContent = '';
            try {
                const url = yield this.upload(file);
                this.statusEl.textContent = 'Uploaded!';
                this.linkEl.innerHTML = `<a href="${url}" target="_blank">Download file</a>`;
                const total = yield this.fetchStats();
                this.statsEl.textContent = `Всего файлов: ${total}`;
            }
            catch (err) {
                this.statusEl.textContent = 'Error';
                console.error(err);
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const apiBase = 'http://localhost:3000/api/files'; // ваш URL
    const statusEl = document.getElementById('status');
    const linkEl = document.getElementById('link');
    const statsEl = document.getElementById('stats');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const uploader = new Uploader(apiBase, statusEl, linkEl, statsEl, progressContainer, progressBar);
    // Показываем имя выбранного файла
    const fileInput = document.getElementById('fileInput');
    const fileLabel = document.getElementById('fileLabel');
    fileInput.addEventListener('change', () => {
        var _a, _b;
        fileLabel.textContent = ((_b = (_a = fileInput.files) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.name) || 'Выберите файл';
    });
    // Запуск загрузки по сабмиту
    document
        .getElementById('uploadForm')
        .addEventListener('submit', (e) => void uploader.handleSubmit(e));
});
