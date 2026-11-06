# AlexWebBackend

REST API для регистрации, авторизации и управления профилем пользователя. Проект разработан на **NestJS 11**, **TypeScript**, **Prisma 6**, **PostgreSQL** и **Redis**.

## Возможности

- Регистрация и вход по логину и паролю, хэширование паролей Argon2.
- Access JWT для защищённых API-методов; refresh JWT в `HttpOnly` cookie.
- Сессии в Redis (`express-session` + `connect-redis`).
- Хранение SHA-256-хэша текущего refresh JWT в сессии и его замена при обновлении токенов.
- Получение списка активных пользователей с пагинацией и поиском по логину.
- Просмотр и изменение собственного профиля, смена пароля, мягкое удаление аккаунта (`deletedAt`).
- Валидация переменных окружения через Zod; Swagger/OpenAPI.
- Обработка HTTP- и Prisma-ошибок глобальным фильтром.


## Технологии

| Категория | Технологии |
| --- | --- |
| Сервер | Node.js 22, NestJS 11, TypeScript |
| База данных | PostgreSQL 15.2, Prisma ORM 6.19.3 |
| Сессии | Redis 7, ioredis, connect-redis, express-session |
| Авторизация | Passport JWT, @nestjs/jwt, Argon2 |
| Конфигурация | @nestjs/config (`registerAs`), Zod |
| Документация | Swagger / OpenAPI |
| Проверки | ESLint, Prettier, Jest |
| Инфраструктура | Docker Compose, Yarn Classic (1.x) |

## Требования

- **Node.js 22** и **Yarn 1.x**.
- **Docker** с `docker compose` (Docker Desktop на macOS/Windows либо Docker Engine с плагином Compose на Linux).
- Свободные порты `4000` (API), `5433` (PostgreSQL) и `6379` (Redis) либо исправленные значения в `.env`.
- Команды ниже предполагают, что **NestJS запускается на хост-компьютере**, а PostgreSQL и Redis — в Docker.

## Быстрый запуск

Перейдите в каталог backend:

```bash
git clone https://github.com/AlexOneWRLD/AlexWebBackend.git
cd AlexWebBackend/backend
```

Создайте локальный файл окружения:

```bash
cp .env.example .env
```

**Перед запуском замените демонстрационные пароли и секреты в `.env`.** Пароли `POSTGRES_PASSWORD` и `REDIS_PASSWORD` должны совпадать с данными в `POSTGRES_URL` и `REDIS_URL` соответственно. Не коммитьте `.env`.

Установите зависимости и поднимите инфраструктуру:

```bash
yarn install --frozen-lockfile
docker compose up -d
```

Примените подготовленные миграции и сгенерируйте Prisma Client:

```bash
yarn prisma migrate deploy
yarn prisma generate
```

Запустите API:

```bash
yarn start:dev
```

После запуска:

- API: **http://localhost:4000**
- Swagger UI: **http://localhost:4000/docs**
- OpenAPI JSON: **http://localhost:4000/swagger.json**
- OpenAPI YAML: **http://localhost:4000/swagger.yaml**

> Если миграции завершаются ошибкой, **не выполняйте `prisma migrate reset` без понимания последствий**: это удаляет данные. Проверьте `yarn prisma migrate status` и SQL-файлы миграций. В текущем PR миграция `active_user_unique_indexes` неполная — подробности в ревью.

## Конфигурация .env

Все переменные перечислены в `backend/.env.example`. NestJS читает их через `ConfigModule.forRoot()` и проверяет схемой Zod в `src/config/env.validation.ts`.

| Группа | Переменные | Назначение |
| --- | --- | --- |
| Приложение | `NODE_ENV`, `APPLICATION_PORT`, `APPLICATION_URL`, `ALLOWED_ORIGIN` | Режим, порт API, адрес сервера, разрешённый frontend |
| Cookies | `COOKIES_SECRET`, `COOKIE_DOMAIN` | Секрет для cookie-parser и необязательный домен |
| Сессии | `SESSION_SECRET`, `SESSION_NAME`, `SESSION_MAX_AGE`, `SESSION_HTTP_ONLY`, `SESSION_SECURE`, `SESSION_FOLDER` | Подпись сессии, время жизни, cookie, префикс Redis |
| JWT | `JWT_SECRET`, `JWT_ACCESS_TOKEN_TTL`, `JWT_REFRESH_TOKEN_TTL` | Подпись токенов и время жизни |
| PostgreSQL | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_URL` | Переменные Compose и строка подключения Prisma |
| Redis | `REDIS_USER`, `REDIS_PASSWORD`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_URL` | Настройки Redis и строка подключения приложения |

Для локальной разработки используются следующие значения:

```dotenv
NODE_ENV=development
APPLICATION_PORT=4000
APPLICATION_URL=http://localhost:4000
ALLOWED_ORIGIN=http://localhost:3000

SESSION_NAME=session
SESSION_MAX_AGE=7d
SESSION_HTTP_ONLY=true
SESSION_SECURE=false
SESSION_FOLDER=session:

JWT_ACCESS_TOKEN_TTL=2h
JWT_REFRESH_TOKEN_TTL=7d

POSTGRES_HOST=localhost
POSTGRES_PORT=5433
REDIS_HOST=localhost
REDIS_PORT=6379
COOKIE_DOMAIN=
```

В этот пример намеренно не включены настоящие секреты. Значения `POSTGRES_URL`, `REDIS_URL`, пароли и ключи берите из `.env.example` и заменяйте на собственные. Генерация длинного случайного секрета:

```bash
openssl rand -hex 32
```

**Примечание:** `POSTGRES_HOST` и `REDIS_HOST` относятся к запуску приложения на компьютере. Если backend позднее будет работать в сети Docker Compose, внутри контейнера вместо `localhost` нужны имена сервисов `db:5432` и `redis:6379`, а также соответствующие изменения URL подключения. Существующие volumes PostgreSQL не меняют пароль автоматически при правке `.env`.

## Docker Compose

Файл: `backend/docker-compose.yaml`.

```bash
# Запуск PostgreSQL и Redis
docker compose up -d

# Состояние контейнеров
docker compose ps

# Логи
docker compose logs -f db
docker compose logs -f redis

# Остановка без удаления данных
docker compose down
```

PostgreSQL доступен по `127.0.0.1:5433`, Redis — по `127.0.0.1:6379` при значениях `.env` по умолчанию. Данные хранятся в именованных томах `postgres_data` и `redis_data`.

**Не используйте `docker compose down -v`, если хотите сохранить базу и данные Redis.**

## Миграции Prisma

Файлы модели: `prisma/schema.prisma`, конфигурация CLI: `prisma.config.ts`, история миграций: `prisma/migrations/`.

```bash
# Проверить схему
yarn prisma validate

# Проверить состояние миграций
yarn prisma migrate status

# Применить уже существующие миграции (развёртывание и проверка)
yarn prisma migrate deploy

# Сгенерировать Prisma Client
yarn prisma generate

# Создать новую миграцию во время разработки
yarn prisma migrate dev --name my_change

# Создать миграцию для ручного SQL (например, CHECK/индекса)
yarn prisma migrate dev --name my_sql_change --create-only
```

**Важно:** миграции, которые уже были применены, нельзя редактировать задним числом: Prisma сверяет их контрольные суммы. Если нужно добавить новый `CHECK` или индекс, создайте отдельную миграцию. Команда `migrate deploy` применяет существующие миграции и не создаёт новые.

### Скрипты Prisma в package.json

Рекомендуется привести скрипты к следующему виду:

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:migrate:dev": "prisma migrate dev",
    "prisma:status": "prisma migrate status"
  }
}
```

После изменения `package.json` можно будет выполнять `yarn prisma:migrate` для применения уже подготовленных миграций. **В текущем PR скрипт `prisma:migrate` ещё равен `prisma migrate` и требует исправления.** До правки используйте явную команду `yarn prisma migrate deploy`.

## API

Все защищённые маршруты требуют заголовок `Authorization: Bearer <accessToken>`. Refresh JWT и session ID передаются в cookies. Полное описание запросов, ответов и DTO — в Swagger UI на `/docs`.

| Метод | Маршрут | Назначение | Авторизация |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Создать пользователя и авторизовать | Нет |
| `POST` | `/auth/login` | Вход по логину и паролю | Нет |
| `POST` | `/auth/refresh` | Обновить JWT с использованием cookies | Redis-сессия + refresh cookie |
| `POST` | `/auth/logout` | Завершить сессию и очистить cookies | Session cookie |
| `GET` | `/users/me` | Свой профиль | Access JWT |
| `GET` | `/users` | Активные пользователи, пагинация и поиск | Access JWT |
| `PATCH` | `/users/me` | Обновить поля профиля | Access JWT |
| `PATCH` | `/users/me/password` | Сменить пароль | Access JWT |
| `DELETE` | `/users/me` | Мягко удалить аккаунт | Access JWT |

### Пример регистрации

```bash
curl -i -c cookies.txt \
  -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Alexander",
    "login": "alex_demo",
    "email": "alex_demo@example.com",
    "age": 28,
    "description": "Backend developer",
    "password": "Password123!",
    "passwordRepeat": "Password123!"
  }'
```

Ожидаемый успешный ответ содержит `accessToken`. Refresh JWT и сессионная cookie записываются через `Set-Cookie` и сохранены командой `curl` в локальном файле `cookies.txt`.

### Пример входа

```bash
curl -i -c cookies.txt \
  -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"login":"alex_demo","password":"Password123!"}'
```

### Получение профиля

Подставьте access JWT из ответа регистрации или входа:

```bash
curl http://localhost:4000/users/me \
  -H 'Authorization: Bearer ACCESS_TOKEN'
```

### Список пользователей

```bash
curl 'http://localhost:4000/users?page=1&limit=12&search=alex' \
  -H 'Authorization: Bearer ACCESS_TOKEN'
```

Поддерживаются `page >= 1`, `limit` в допустимом диапазоне DTO (в текущем коде до 150) и фильтрация по логину.

### Обновление токена

```bash
curl -i -b cookies.txt -c cookies.txt \
  -X POST http://localhost:4000/auth/refresh
```

Для обновления нужны **обе cookies**: session ID и refresh JWT. Успешный ответ содержит новый access JWT; cookie с refresh JWT обновляется. Для последующих запросов используйте актуальный `cookies.txt`.

### Выход

```bash
curl -i -b cookies.txt -c cookies.txt \
  -X POST http://localhost:4000/auth/logout
```

Выход уничтожает серверную сессию и очищает cookies. Уже выпущенный access JWT не отзывается немедленно и может оставаться действительным до истечения его TTL, если учётная запись активна.

**Безопасность:** файл `cookies.txt` содержит учётные данные сессии; не добавляйте его в Git и удаляйте после тестов. Для браузерного клиента запросы с cookies должны использовать `credentials: 'include'`, а сервер разрешает CORS для `ALLOWED_ORIGIN` с `credentials: true`.

## Обработка ошибок

API использует глобальный `AllExceptionsFilter` с форматом:

```json
{
  "statusCode": 401,
  "message": "Сессия истекла. Войдите заново",
  "error": "Unauthorized"
}
```

Ожидаемые сценарии: 400 — неверный ввод; 401 — отсутствие/ошибка авторизации; 404 — ресурс отсутствует; 409 — конфликт данных; 500 — неожиданная ошибка сервера. Сообщения ошибок валидации могут возвращаться массивом строк.

## Проверки и тестирование

```bash
# Проверка TypeScript
yarn tsc --noEmit --incremental false

# ESLint
yarn lint

# Автоисправление части замечаний
yarn lint:fix

# Unit-тесты
yarn test --runInBand

# Покрытие
yarn test:cov

# Сборка
yarn build
```

Сейчас в PR присутствуют тесты контроллеров (`auth.controller.spec.ts` и `user.controller.spec.ts`), но для надёжной проверки необходимо дополнить их тестами сервисов, ошибок валидации, миграций и e2e-сценариями авторизации. Команда `yarn test:e2e` требует существующего файла `test/jest-e2e.json`; убедитесь, что он добавлен прежде чем использовать её.

## Структура приложения

```text
backend/
├── .env.example                # Шаблон переменных окружения
├── docker-compose.yaml          # PostgreSQL и Redis
├── prisma.config.ts             # Конфигурация Prisma CLI
├── prisma/
│   ├── schema.prisma            # Модель User и UserRole
│   └── migrations/              # SQL-миграции
├── src/
│   ├── auth/                    # Авторизация, guards, JWT, DTO
│   ├── user/                    # Пользователи, сервис и репозиторий
│   ├── common/                  # Общие ошибки, валидация, утилиты
│   ├── config/                  # registerAs и Zod
│   ├── prisma/                  # PrismaService
│   ├── types/                   # Расширения типов Express Session
│   ├── app.module.ts
│   └── main.ts
├── src/redis/
│		├── redis.module.ts
│		└── redis.service.ts
└── package.json
```

## Частые проблемы

**`Prisma: P1001` или база недоступна.** Проверьте `docker compose ps`, порт `5433`, значения `POSTGRES_URL` и логи контейнера `db`.

**Ошибка подключения Redis.** Проверьте `REDIS_URL`, `REDIS_PASSWORD`, порт `6379`, контейнер `redis`. Пароль в URL должен совпадать с паролем сервера.

**`The migration was modified after it was applied`.** Нельзя редактировать уже применённые миграции. Восстановите исходный SQL-файл и создайте новую миграцию; не сбрасывайте данные без необходимости.

**`COOKIE_DOMAIN` при localhost.** Оставляйте пустым. Для локального HTTP используется `SESSION_SECURE=false`, а для HTTPS в production — `true`.

**401 при `/auth/refresh`.** Проверьте наличие и сессионной, и refresh cookie. После входа сохраните cookies, например через `curl -c cookies.txt`.

**Переменная окружения не проходит Zod.** Сверьте ключи с `.env.example`; булевы значения задаются строго `true` или `false`, TTL — `15m`, `2h` или `7d`.

## Примечания по безопасности

- Никогда не сохраняйте настоящие `.env`, JWT-секреты, cookie-файлы и пароли в репозитории.
- Для production используйте отдельные длинные случайные секреты, HTTPS и безопасные cookies.
- Access JWT храните и передавайте согласно принятой модели безопасности frontend; refresh JWT остаётся `HttpOnly` cookie.
- Текущая проверка хэша refresh JWT защищает от последовательного повторного использования; строгая одноразовость при конкурентных запросах требует атомарной операции в Redis.
- В миграциях обязательно должны присутствовать уникальные частичные индексы активных `login` и `email`.
