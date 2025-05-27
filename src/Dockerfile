FROM python:3.12.0

# Установка переменные окружения
ENV HOME=/home/weather-forecast \
    APP_HOME=/home/weather-forecast/src \
    PYTHONPATH="$PYTHONPATH:/home/weather-forecast" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Создание домашней директории для пользователя(/home/weather-forecast) и директории проекта(/home/weather-forecast/src)
# Создание группы wfuser
# Создание отдельного пользователя wfuser
RUN mkdir -p $APP_HOME \
 && groupadd -r wfuser\
 && useradd -r -g wfuser wfuser

# Установка рабочей директории
WORKDIR $HOME

# Копирование проекта FastAPI в рабочую директорию
COPY src src

# Обновление pip
# Установка зависимостей из списка  requirements.txt
# Изменение владельца для всех директорий и файлов проекта на пользователя fast
RUN pip install --upgrade pip \
 && pip install -r src/requirements.txt \
 && chown -R wfuser:wfuser .

# Изменение рабочего пользователя на fast
USER wfuser