from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

# from app.schemas import CityRequest
from src.app.routers import weather

app = FastAPI()

# Получаем абсолютный путь к директории static
static_dir = Path(__file__).parent / "static"

# Монтируем статическую директорию
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def read_root():
    return FileResponse(static_dir / "index.html")

app.include_router(weather.router)
