"use strict";
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
class Uploader {
    constructor(apiBase, statusEl, linkEl, statsEl) {
        this.apiBase = apiBase;
        this.statusEl = statusEl;
        this.linkEl = linkEl;
        this.statsEl = statsEl;
    }
    upload(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const formData = new FormData();
            formData.append('file', file);
            const resp = yield fetch(`${this.apiBase}/upload`, {
                method: 'POST',
                body: formData,
            });
            if (!resp.ok) {
                const text = yield resp.text();
                throw new Error(text || `Upload failed: ${resp.status}`);
            }
            return resp.json();
        });
    }
    fetchStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch(`${this.apiBase}/stats`);
            if (!resp.ok) {
                const text = yield resp.text();
                throw new Error(text || `Stats failed: ${resp.status}`);
            }
            return resp.json();
        });
    }
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
                const { url } = yield this.upload(file);
                this.statusEl.textContent = 'Uploaded!';
                this.linkEl.innerHTML = `<a href="${url}" target="_blank">Download file</a>`;
                const { total } = yield this.fetchStats();
                this.statsEl.textContent = `Total files: ${total}`;
            }
            catch (err) {
                this.statusEl.textContent = 'Error';
                console.error(err);
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const apiBase = 'http://localhost:3000/api/files';
    const uploader = new Uploader(apiBase, document.getElementById('status'), document.getElementById('link'), document.getElementById('stats'));
    document
        .getElementById('uploadForm')
        .addEventListener('submit', (e) => void uploader.handleSubmit(e));
});
