/* =========================================================
 * Weather App 🌤️
 * Live weather via OpenWeather API.
 * Features: search, temp, condition, humidity, wind,
 *           dynamic background, icons, loading, errors,
 *           current date/time.
 * ========================================================= */

// ⚠️  Replace with your own free API key from https://openweathermap.org/api
const API_KEY = "2f54a16839ea6658252ba62024895275";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ---------- DOM ----------
const searchForm  = document.getElementById("searchForm");
const cityInput   = document.getElementById("cityInput");
const loader      = document.getElementById("loader");
const errorBox    = document.getElementById("errorBox");
const errorMsg    = document.getElementById("errorMsg");
const weatherCard = document.getElementById("weatherCard");

const cityNameEl   = document.getElementById("cityName");
const countryEl    = document.getElementById("country");
const dateTimeEl   = document.getElementById("dateTime");
const weatherIcon  = document.getElementById("weatherIcon");
const tempEl       = document.getElementById("temp");
const conditionEl  = document.getElementById("condition");
const feelsLikeEl  = document.getElementById("feelsLike");
const humidityEl   = document.getElementById("humidity");
const windEl       = document.getElementById("wind");
const visibilityEl = document.getElementById("visibility");

// ---------- Helpers ----------
function showEl(el)  { el.classList.remove("hidden"); }
function hideEl(el)  { el.classList.add("hidden"); }

function formatDateTime(timezoneOffset) {
    // Current UTC time + location timezone offset
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const local = new Date(utc + timezoneOffset * 1000);

    return local.toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "short", day: "numeric",
    }) + "  •  " + local.toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit",
    });
}

function setDynamicBackground(weatherMain) {
    const key = weatherMain.toLowerCase();
    const validKeys = ["clear", "clouds", "rain", "drizzle", "thunderstorm", "snow", "mist", "fog", "haze"];
    document.body.setAttribute("data-weather", validKeys.includes(key) ? key : "clear");
}

// ---------- Fetch Weather ----------
async function fetchWeather(city) {
    hideEl(weatherCard);
    hideEl(errorBox);
    showEl(loader);

    try {
        const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
        const res = await fetch(url);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            if (res.status === 401) {
                throw new Error("Invalid API key. Please add your OpenWeather API key in script.js.");
            }
            throw new Error(data.message || `City "${city}" not found.`);
        }

        const data = await res.json();
        renderWeather(data);
    } catch (err) {
        hideEl(loader);
        hideEl(weatherCard);
        errorMsg.textContent = err.message || "Something went wrong.";
        showEl(errorBox);
    }
}

// ---------- Render ----------
function renderWeather(data) {
    hideEl(loader);
    hideEl(errorBox);

    const { main, weather, wind, visibility, name, sys, timezone } = data;
    const w = weather[0];

    // City & country
    cityNameEl.textContent = name;
    countryEl.textContent  = sys.country ? `(${sys.country})` : "";

    // Date & time
    dateTimeEl.textContent = formatDateTime(timezone);

    // Icon (2x for sharpness)
    weatherIcon.src = `https://openweathermap.org/img/wn/${w.icon}@4x.png`;
    weatherIcon.alt = w.description;

    // Temperature
    tempEl.textContent = Math.round(main.temp);

    // Condition
    conditionEl.textContent = w.description;

    // Details
    feelsLikeEl.textContent  = `${Math.round(main.feels_like)}°C`;
    humidityEl.textContent   = `${main.humidity}%`;
    windEl.textContent       = `${(wind.speed * 3.6).toFixed(1)} km/h`;
    visibilityEl.textContent = visibility >= 1000
        ? `${(visibility / 1000).toFixed(1)} km`
        : `${visibility} m`;

    // Dynamic background
    setDynamicBackground(w.main);

    showEl(weatherCard);
}

// ---------- Events ----------
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;
    fetchWeather(city);
});

// Allow Enter key in input
cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        searchForm.dispatchEvent(new Event("submit"));
    }
});

// ---------- Demo / Init ----------
// Try a default city on load (optional)
// fetchWeather("London");

