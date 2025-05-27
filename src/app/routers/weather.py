import json
from fastapi import APIRouter, Request, Response
import aiohttp
from fastapi.responses import JSONResponse
from collections import Counter

from src.app.schemas import CityRequest


router = APIRouter(prefix='/api', tags=['weather ⛅'])

async def fetch_json(session, url):
    async with session.get(url) as response:
        return await response.json()


@router.post("/weather")
async def get_weather(city_request: CityRequest, request: Request, response: Response):
    try:
        async with aiohttp.ClientSession() as session:
            # Получаем координаты города
            geocoding_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city_request.city}&count=1&language=ru&format=json"
            geocoding_data = await fetch_json(session, geocoding_url)
            
            if not geocoding_data.get("results"):
                return {"error": "Город не найден"}
            
            location = geocoding_data["results"][0]
            latitude = location["latitude"]
            longitude = location["longitude"]
            
            # Получаем прогноз погоды
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
            weather_data = await fetch_json(session, weather_url)
            
            # Получаем текущую историю из cookie
            history = request.cookies.get("weatherHistory", "[]")
            history = json.loads(history)
            
            # Обновляем историю
            history.append(city_request.city)
            
            # Устанавливаем обновлённую cookie
            response.set_cookie(
                key="weatherHistory",
                value=json.dumps(history),
                max_age=30*24*60*60  # 30 дней
            )
            
            return {
                "location": {
                    "name": location["name"],
                    "admin1": location.get("admin1"),
                    "country": location.get("country")
                },
                "weather": weather_data
            }
    except aiohttp.ClientError as e:
        return {"error": f"Ошибка при запросе к API: {str(e)}"}
    except Exception as e:
        return {"error": f"Произошла ошибка: {str(e)}"}


@router.get("/city-suggestions")
async def get_city_suggestions(q: str):
    if len(q) < 2:
        return JSONResponse([])
    
    try:
        async with aiohttp.ClientSession() as session:
            url = f"https://geocoding-api.open-meteo.com/v1/search?name={q}&count=5&language=ru"
            async with session.get(url) as response:
                data = await response.json()
                suggestions = [
                    {
                        "name": res['name'],
                        "region": res.get('admin1', ''),
                        "country": res.get('country', ''),
                        "full_name": f"{res['name']}, {res.get('admin1', '')}, {res.get('country', '')}"
                    }
                    for res in data.get('results', [])
                ]
                return JSONResponse(suggestions)
    except Exception as e:
        print(f"Error fetching suggestions: {e}")
        return JSONResponse([])


@router.get("/weather-history")
async def get_weather_history(request: Request) -> dict:
    # Получаем текущую историю из cookie
            history = request.cookies.get("weatherHistory", "[]")
            try:
                history = json.loads(history)
                history = dict(Counter(history))
            except:
                history = {}
            
            return history
