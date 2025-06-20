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


```Установка и запуск```
git clone https://github.com/japusta/file-dropper.git
cd file-dropper

Отредактируйте .env подставив реальные значения:

PORT=3000
STORAGE_TYPE=supabase

SUPABASE_URL=https://emlltllefprdccuoyoie.supabase.co

SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbGx0bGxlZnByZGNjdW95b2llIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU5NTk4NSwiZXhwIjoyMDY0MTcxOTg1fQ.kmYwwGet5M4py0gcijwtT0yCjiuj22sRp3DdTK_BiUQ

SUPABASE_BUCKET=test.doczilla.files

```ПРИМЕР РАБОТЫ```

![{15A01B23-E30A-441D-BAC7-2421A317F3AD}](https://github.com/user-attachments/assets/289b804d-79f6-432e-b2fd-b1db98423da5)

![{7A90A408-E399-456F-A8F8-54B2666DF7D3}](https://github.com/user-attachments/assets/9c0990d1-0c22-4c35-9050-161be05ea45e)

![{43658BAD-7FF2-4F03-BB7C-C465E05F2265}](https://github.com/user-attachments/assets/ff11ca6c-835c-41ad-9e2f-79f570483f9f)

![{1D4ECFDC-BB0A-4E4F-9F7F-CBAB7FAE21C1}](https://github.com/user-attachments/assets/f5a17a8e-cb70-4eac-842e-1f9d4789bf73)

![{11765CCC-8273-4587-908F-DE3BD696AD26}](https://github.com/user-attachments/assets/abd50737-8d33-4132-af61-49248ecfe448)

![{FE73A362-006C-45B0-AA24-858275FC5DB2}](https://github.com/user-attachments/assets/fe969159-37ea-44ed-bfce-fdd7b060d26f)


```Установка зависимостей```

cd backend

npm install

npm run dev

для prod-версии

npm run build

npm run start

cd ../frontend

npm install

npm run dev

для prod-версии

npm run build

npm run start
