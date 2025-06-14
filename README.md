# Приложение "Прогноз погоды"

## Описание проекта

Веб-приложение для просмотра прогноза погоды с возможностью:

-   Поиска погоды по городам
-   Просмотра текущих условий
-   Отображения почасового и недельного прогноза
-   Сохранения истории поиска

## Реализованные функции

1. **Основной функционал**:

    - Поиск городов с автодополнением
    - Детальная информация о погоде (температура, влажность, ветер)
    - Почасовой прогноз на 24 часа
    - Прогноз на 7 дней

2. **История поиска**:

    - Автоматическое сохранение городов
    - Отображение последних 5 уникальных городов
    - Быстрый доступ к предыдущим запросам

3. **Техническая реализация**:
    - Хранение истории в cookies
    - Адаптивный интерфейс
    - Обработка ошибок и индикаторы загрузки

## Используемые технологии

-   **Бэкенд**:

    -   Python 3.11
    -   FastAPI (веб-фреймворк)
    -   aiohttp (HTTP-клиент)

-   **Фронтенд**:

    -   HTML5, CSS3
    -   Чистый JavaScript
    -   Адаптивный дизайн (CSS Grid/Flexbox)

-   **Внешние API**:
    -   Open-Meteo (данные о погоде)
    -   Open-Meteo Geocoding (поиск городов)

## Установка и запуск

### Требования

-   Python 3.11+
-   Менеджер пакетов pip

### Шаги установки

1. Клонируйте репозиторий:

```bash
git clone https://github.com/ntomas2/weather_forecast.git
cd weather_forecast
```

2. Создайте и активируйте виртуальное окружение:

```bash
python -m venv venv
source venv/bin/activate  # Linux/MacOS
venv\Scripts\activate     # Windows
```

3. Установите зависимости:

```bash
pip install -r src/requirements.txt
```

### Запуск приложения

1. Запустите сервер:

```bash
uvicorn src.main:app --reload
```

2. Откройте приложение в браузере:

```
http://localhost:8000
```

3. Запуск через docker compose:

```
docker compose -f docker-compose.yaml up -d --build
http://localhost:8000
```

### Запуск тестов

1. Установите тестовые зависимости:

```bash
pip install pytest httpx pytest-asyncio
```

2. Запустите тесты:

```bash
cd src
pytest test_api.py -v
```

## Структура проекта

```
weather_forecast/
├── 📂src
│   ├── 📂app
│   │   ├── 📂routers
│   │   │   ├── 📜__init__.py
│   │   │   └── 📜weather.py
│   │   ├── 📜__init__.py
│   │   └── 📜schemas.py
│   ├── 📂static
│   │   ├── 📜index.html
│   │   ├── 📜scripts.js
│   │   └── 📜styles.css
│   ├── 📜__init__.py
│   ├── 📜Dockerfile
│   ├── 📜main.py
│   ├── 📜requirements.txt
│   └── 📜test_api.py
├── .gitignore
├── docker-compose.yaml
├── README.md
```

## API endpoints

-   `POST /api/weather` - Получение погоды для города
-   `GET /api/city-suggestions` - Поиск городов с автодополнением
-   `GET /api/weather-history` - Получение истории поиска
-   `GET /` - Главная страница приложения

## Лицензия

Проект распространяется под лицензией MIT.
