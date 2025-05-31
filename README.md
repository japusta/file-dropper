Это простой сервис для обмена файлами, состоящий из бекенда (Express + Supabase) и фронтенда (Vanilla TypeScript + Axios). Организован по слоям: разделены ответственность за хранение файлов, авторизацию, контроллеры, представление (View) и логику координации (Controller).

Постарался создать максимально расширяемый (Open/Closed), разделённый по обязанностям (Single Responsibility) код, при этом оставив его простым (KISS) и без дублирования (DRY).

``` (/backend)```

Предоставляет API для загрузки файлов и получения статистики.

Реализован с использованием Express, Supabase (как хранилище) и Cron для периодической чистки.

Валидация запросов через ApiKeyAuth (заголовок x-api-key).

Каждый слой оформлен через интерфейсы и небольшие классы (например, IStorage, IAuthMiddleware, FilesController, SupabaseStorage), что облегчает поддержку и расширение.

```(/frontend)```

Одностраничное приложение на чистом TypeScript, без фреймворков.

Axios для HTTP-запросов, управление DOM – Vanilla JS.

Слои:

IFileService / AxiosFileService – интерфейс и реализация для общения с бекендом.

IProgressView / ProgressView – управление прогресс-баром.

IModalView / ModalView – кастомное модальное окно («Скачать/Копировать»).

IToastView / ToastView – показ «тоаст»-уведомлений.

UploadFormView – обёртка над HTML-формой, которая отслеживает выбор файла и сабмит.

UploaderController – связывает все компоненты воедино: когда пользователь нажимает Upload, контроллер вызывает IFileService.uploadFile, обновляет прогресс через IProgressView, затем показывает ссылку, открывает модалку с выбором действия, показывает toast и обновляет статистику.

```Технологии и зависимости```

```backend```

Node.js 

Express — веб-фреймворк для маршрутизации и middleware.

Supabase JS SDK (@supabase/supabase-js) — работа с Supabase Storage.

Multer — парсинг multipart/form-data для загрузки файлов в память.

Node-cron — периодические задачи (чистка старых файлов).

UUID — генерация уникальных имён файлов.

dotenv — загрузка .env в process.env.

CORS — включение cross-origin доступа.

```frontend```
TypeScript

Axios 

Parcel — простой бандлер (собирает TS, CSS, HTML в один бандл).

```Структура проекта```

backend/src/auth
— Интерфейс и реализация middleware для проверки API-ключа.

backend/src/storage
— Интерфейс IStorage и конкретная реализация SupabaseStorage для работы с Supabase Storage.

backend/src/controllers
— FilesController с маршрутами /upload и /stats.

backend/src/App.ts
— Конфигурирует Express-приложение, подключает middleware, маршруты, error-handler и cron-задачу.

backend/src/server.ts
— Точка входа: создаёт и запускает App.

frontend/src/index.html
— Разметка формы загрузки, прогресс-бар, контейнер для статуса/ссылки/статистики, модальное окно и уведомление.

frontend/src/style.css
— Стили для контейнера, кнопок, прогресс-бара, модалки и toast’а.

frontend/src/script.ts
— Все классы и интерфейсы: от IFileService до UploaderController, собираемые в DOMContentLoaded.
