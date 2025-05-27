import pytest
from fastapi.testclient import TestClient
from src.main import app
import json

client = TestClient(app)

def test_get_weather_with_history():
    # Первый запрос - создает cookie
    response = client.post(
        "/api/weather",
        json={"city": "Москва"}
    )
    assert response.status_code == 200
    assert "weatherHistory" in response.cookies
    
    # Проверяем что город сохранился в историю
    history = json.loads(response.cookies["weatherHistory"])
    history = json.loads(history)
    assert "Москва" in history

def test_get_history():
    # Сначала создаем историю
    client.post("/api/weather", json={"city": "Москва"})
    client.post("/api/weather", json={"city": "Париж"})
    
    # Получаем историю
    response = client.get("/api/weather-history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert len(data) == 2
    assert "Москва" in data.keys()
    assert "Париж" in data.keys()

def test_empty_history():
    # Проверяем пустую историю для нового пользователя
    response = client.get("/api/weather-history", cookies={'weatherHistory': '[]'})
    assert response.status_code == 200
    assert response.json() == {}

def test_invalid_cookie():
    # Проверяем обработку невалидной cookie
    response = client.get("/api/weather-history", cookies={"weatherHistory": "invalid"})
    assert response.status_code == 200
    assert response.json() == {}