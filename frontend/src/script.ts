import { AxiosFileService } from './services/AxiosFileService';
import { ProgressView } from './views/ProgressView';
import { ModalView } from './views/ModalView';
import { ToastView } from './views/ToastView';
import { UploadFormView } from './views/UploadFormView';
import { UploaderController } from './controllers/UploaderController';

document.addEventListener('DOMContentLoaded', () => {
  // 1) инициализация
  const fileService = new AxiosFileService('http://localhost:3000/api/files');

  // 2) инициализация progress-view
  const progressContainer = document.getElementById('progressContainer')!;
  const progressBar       = document.getElementById('progressBar')!;
  const progressView      = new ProgressView(progressContainer, progressBar);

  // 3) инициализация toast-view
  const toastEl   = document.getElementById('toast')!;
  const toastView = new ToastView(toastEl);

  // 4) инициализация modal-view (callback для toast при копировании)
  const modalEl     = document.getElementById('choiceModal')!;
  const downloadBtn = document.getElementById('downloadBtn')!;
  const copyBtn     = document.getElementById('copyBtn')!;
  const closeBtn    = document.getElementById('closeBtn')!;
  const modalView   = new ModalView(
    modalEl,
    downloadBtn,
    copyBtn,
    closeBtn,
    (message) => toastView.showMessage(message)
  );

  // 5) инициализация обёртку над формой
  const formView = new UploadFormView(
    'uploadForm',  // id <form>
    'fileInput',   // id <input type="file">
    'fileLabel'    // id <span> в label
  );

  // 6) DOM-элементы для статуса, ссылки и статистики
  const statusEl = document.getElementById('status')!;
  const linkEl   = document.getElementById('link')!;
  const statsEl  = document.getElementById('stats')!;

  new UploaderController(
    fileService,
    progressView,
    modalView,
    toastView,
    formView,
    statusEl,
    linkEl,
    statsEl
  );
});
