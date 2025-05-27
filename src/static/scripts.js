// DOM Elements
const cityInput = document.getElementById("city-input");
const suggestionsDropdown = document.getElementById("suggestions");
const searchBtn = document.getElementById("search-btn");
const weatherResult = document.getElementById("weather-result");
const errorMessage = document.getElementById("error-message");
const loadingOverlay = document.getElementById("loading");
const cityNameElement = document.getElementById("city-name");
const currentWeatherElement = document.getElementById("current-weather");
const hourlyWeatherElement = document.getElementById("hourly-weather");
const dailyWeatherElement = document.getElementById("daily-weather");

// Debounce timer
let debounceTimer;

// Weather code descriptions
const WEATHER_CODES = {
    0: "Ясно",
    1: "Преимущественно ясно",
    2: "Переменная облачность",
    3: "Пасмурно",
    45: "Туман",
    48: "Туман с инеем",
    51: "Морось: слабая",
    53: "Морось: умеренная",
    55: "Морось: сильная",
    56: "Ледяная морось: слабая",
    57: "Ледяная морось: сильная",
    61: "Дождь: слабый",
    63: "Дождь: умеренный",
    65: "Дождь: сильный",
    66: "Ледяной дождь: слабый",
    67: "Ледяной дождь: сильный",
    71: "Снег: слабый",
    73: "Снег: умеренный",
    75: "Снег: сильный",
    77: "Снежные зерна",
    80: "Ливень: слабый",
    81: "Ливень: умеренный",
    82: "Ливень: сильный",
    85: "Снегопад: слабый",
    86: "Снегопад: сильный",
    95: "Гроза",
    96: "Гроза со слабым градом",
    99: "Гроза с сильным градом",
};

// Event Listeners
cityInput.addEventListener("input", handleCityInput);
searchBtn.addEventListener("click", fetchWeather);
document.addEventListener("click", handleDocumentClick);

// LocalStorage keys
const LAST_CITY_KEY = "lastCity";
const CITY_HISTORY_KEY = "cityHistory";
const MAX_HISTORY_ITEMS = 5;

// При загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    loadLastCity();
    setupCityHistory();
});

// Загрузить последний просмотренный город
function loadLastCity() {
    const lastCity = localStorage.getItem(LAST_CITY_KEY);
    if (lastCity) {
        // cityInput.value = lastCity;
        showRecentCityPrompt(lastCity);
    }
}

// Показать подсказку с последним городом
function showRecentCityPrompt(cityName) {
    const promptContainer = document.createElement("div");
    promptContainer.className = "recent-city-prompt";
    promptContainer.innerHTML = `
        <p>Смотреть снова погоду в ${cityName}?</p>
        <button id="recent-city-btn">Да</button>
    `;

    document.querySelector(".container").prepend(promptContainer);

    document
        .getElementById("recent-city-btn")
        .addEventListener("click", () => {
            cityInput.value = cityName;
            fetchWeather();
            promptContainer.remove();
        });
}

// Сохранить город в историю
function saveCityToHistory(cityData) {
    localStorage.setItem(LAST_CITY_KEY, cityData.full_name);

    let history = JSON.parse(localStorage.getItem(CITY_HISTORY_KEY)) || [];
    history = history.filter((item) => item.full_name !== cityData.full_name);
    history.unshift({
        name: cityData.name,
        region: cityData.region,
        country: cityData.country,
        full_name: cityData.full_name,
        timestamp: new Date().toISOString(),
    });

    if (history.length > MAX_HISTORY_ITEMS) {
        history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(CITY_HISTORY_KEY, JSON.stringify(history));
}

// Настроить историю городов
function setupCityHistory() {
    const history = JSON.parse(localStorage.getItem(CITY_HISTORY_KEY)) || [];
    if (history.length === 0) return;

    const historyContainer = document.createElement("div");
    historyContainer.className = "city-history";
    historyContainer.innerHTML = `
        <h3>Недавние города:</h3>
        <ul class="history-list"></ul>
    `;

    document.querySelector(".container").appendChild(historyContainer);

    const list = historyContainer.querySelector(".history-list");

    history.forEach((city) => {
        const item = document.createElement("li");
        item.className = "history-item";
        item.innerHTML = `
            <span>${city.name}${city.region ? ", " + city.region : ""}</span>
            <button class="history-btn">Выбрать</button>
        `;

        item.querySelector(".history-btn").addEventListener("click", () => {
            cityInput.value = city.full_name;
            fetchWeather();
        });

        list.appendChild(item);
    });
}

// Handle city input with debounce
function handleCityInput(e) {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();

    if (query.length < 2) {
        hideSuggestions();
        return;
    }

    debounceTimer = setTimeout(() => {
        fetchCitySuggestions(query);
    }, 300);
}

// Fetch city suggestions from API
async function fetchCitySuggestions(query) {
    try {
        const response = await fetch(
            `/api/city-suggestions?q=${encodeURIComponent(query)}`
        );
        const suggestions = await response.json();
        displaySuggestions(suggestions);
    } catch (error) {
        console.error("Ошибка получения подсказок:", error);
        hideSuggestions();
    }
}

// Display suggestions dropdown
function displaySuggestions(suggestions) {
    if (!suggestions || suggestions.length === 0) {
        hideSuggestions();
        return;
    }

    suggestionsDropdown.innerHTML = "";

    suggestions.forEach((suggestion) => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.innerHTML = `
            <div class="city">${suggestion.name}</div>
            <div class="details">${suggestion.region}${
            suggestion.region && suggestion.country ? ", " : ""
        }${suggestion.country}</div>
        `;

        item.addEventListener("click", () => {
            cityInput.value = suggestion.name;
            hideSuggestions();
            fetchWeather();
        });

        suggestionsDropdown.appendChild(item);
    });

    suggestionsDropdown.style.display = "block";
}

// Hide suggestions dropdown
function hideSuggestions() {
    suggestionsDropdown.style.display = "none";
}

// Handle clicks outside the input
function handleDocumentClick(e) {
    if (e.target !== cityInput && !suggestionsDropdown.contains(e.target)) {
        hideSuggestions();
    }
}

// Fetch weather data
async function fetchWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showError("Пожалуйста, введите название города");
        return;
    }

    showLoading();
    hideError();
    hideWeather();

    try {
        const response = await fetch("/api/weather", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ city }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        displayWeather(data);
    } catch (error) {
        showError("Не удалось получить данные о погоде: " + error.message);
    } finally {
        hideLoading();
    }
}

// Display weather data
function displayWeather(data) {
    const { location, weather } = data;

    saveCityToHistory({
        name: location.name,
        region: location.region,
        country: location.country,
        full_name: `${location.name}${
            location.region ? ", " + location.region : ""
        }${location.country ? ", " + location.country : ""}`,
    });

    // Set city name
    cityNameElement.textContent = `${location.name}${
        location.region ? ", " + location.region : ""
    }${location.country ? ", " + location.country : ""}`;

    // Display current weather
    displayCurrentWeather(weather);

    // Display hourly forecast
    displayHourlyForecast(weather);

    // Display daily forecast
    displayDailyForecast(weather);

    weatherResult.classList.remove("hidden");
}

// Display current weather
function displayCurrentWeather(weather) {
    const current = weather.current_weather;
    const time = new Date(current.time);

    currentWeatherElement.innerHTML = `
        <div class="weather-item">
            <div class="weather-label">Время</div>
            <div class="weather-value">${formatTime(time)}</div>
        </div>
        <div class="weather-item">
            <div class="weather-label">Температура</div>
            <div class="weather-value">${current.temperature}°C</div>
        </div>
        <div class="weather-item">
            <div class="weather-label">Ощущается</div>
            <div class="weather-value">${
                weather.hourly.apparent_temperature[0]
            }°C</div>
        </div>
        <div class="weather-item">
            <div class="weather-label">Погода</div>
            <div class="weather-value">${getWeatherDescription(
                current.weathercode
            )}</div>
        </div>
        <div class="weather-item">
            <div class="weather-label">Ветер</div>
            <div class="weather-value">${current.windspeed} км/ч</div>
        </div>
    `;
}

// Display hourly forecast
function displayHourlyForecast(weather) {
    hourlyWeatherElement.innerHTML = "";

    for (let i = 0; i < 24; i++) {
        const time = new Date(weather.hourly.time[i]);
        const temp = weather.hourly.temperature_2m[i];
        const code = weather.hourly.weathercode[i];
        const precip = weather.hourly.precipitation_probability[i];

        const hourElement = document.createElement("div");
        hourElement.className = "weather-item";
        hourElement.innerHTML = `
            <div class="weather-label">${formatHour(time)}</div>
            <div class="weather-value">${temp}°C</div>
            <div>${getWeatherDescription(code)}</div>
            <div>💧 ${precip}%</div>
        `;

        hourlyWeatherElement.appendChild(hourElement);
    }
}

// Display daily forecast
function displayDailyForecast(weather) {
    dailyWeatherElement.innerHTML = "";

    for (let i = 0; i < weather.daily.time.length; i++) {
        const date = new Date(weather.daily.time[i]);
        const maxTemp = weather.daily.temperature_2m_max[i];
        const minTemp = weather.daily.temperature_2m_min[i];
        const code = weather.daily.weathercode[i];
        const precip = weather.daily.precipitation_sum[i];

        const dayElement = document.createElement("div");
        dayElement.className = "weather-item";
        dayElement.innerHTML = `
            <div class="weather-label">${formatDate(date)}</div>
            <div class="weather-value">${maxTemp}° / ${minTemp}°</div>
            <div>${getWeatherDescription(code)}</div>
            <div>🌧 ${precip}mm</div>
        `;

        dailyWeatherElement.appendChild(dayElement);
    }
}

// Helper functions
function formatTime(date) {
    return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatHour(date) {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit" });
}

function formatDate(date) {
    return date.toLocaleDateString("ru-RU", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function getWeatherDescription(code) {
    return WEATHER_CODES[code] || "Неизвестно";
}

function showLoading() {
    loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
    loadingOverlay.classList.add("hidden");
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

function hideError() {
    errorMessage.classList.add("hidden");
}

function hideWeather() {
    weatherResult.classList.add("hidden");
}
