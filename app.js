// app.js

const API_KEY = 'YOUR_WEATHERAPI_COM_API_KEY';
const API_URL = 'https://api.weatherapi.com/v1/forecast.json';

// DOM Elements
const weatherForm = document.getElementById('weatherForm');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const weatherInfoSection = document.getElementById('weatherInfo');
const historyList = document.getElementById('historyList');
const toastElement = document.getElementById('toast');
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

const SEARCH_HISTORY_KEY = 'weatherAppSearchHistory';
const MAX_HISTORY_ITEMS = 5;
const THEME_KEY = 'weatherAppTheme';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

// Toast Notification
const showToast = (message, type = 'success') => {
  toastElement.textContent = message;
  toastElement.className = `toast toast--${type} toast--visible`;
  setTimeout(() => toastElement.classList.remove('toast--visible'), 3000);
};

// Loading Indicator
const toggleLoading = (show) => {
  const loader = document.querySelector('.skeleton-loader');
  if (loader) {
    loader.style.display = show ? 'grid' : 'none';
    if (show) weatherInfoSection.innerHTML = '';
  } else {
    if (show) weatherInfoSection.innerHTML = '<div class="loading">Caricamento...</div>';
    else weatherInfoSection.querySelector('.loading')?.remove();
  }
};

// Render Weather Info
const renderWeatherInfo = (data) => {
  toggleLoading(false);
  const { location, current, forecast } = data;

  weatherInfoSection.innerHTML = `
    <div class="weather-card current-weather">
      <h3>${location.name}, ${location.country}</h3>
      <div class="weather-details">
        <img src="${current.condition.icon}" alt="${current.condition.text}">
        <p class="temperature">${current.temp_c}°C</p>
        <p class="condition">${current.condition.text}</p>
      </div>
      <div class="additional-info">
        <p>Vento: ${current.wind_kph} km/h</p>
        <p>Umidità: ${current.humidity}%</p>
      </div>
    </div>
    <div class="forecast">
      <h3>Previsioni per i prossimi 3 giorni</h3>
      <div class="forecast-cards">
        ${forecast.forecastday.map(day => `
          <div class="weather-card forecast-card">
            <p class="date">${new Date(day.date).toLocaleDateString()}</p>
            <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
            <p class="temperature">Max: ${day.day.maxtemp_c}°C / Min: ${day.day.mintemp_c}°C</p>
            <p class="condition">${day.day.condition.text}</p>
          </div>`).join('')}
      </div>
    </div>
  `;
};

// API Request
const fetchWeatherData = async (lat, lon) => {
  toggleLoading(true);
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}&q=${lat},${lon}&days=3&lang=it`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Errore nel recupero dei dati meteo');
    renderWeatherInfo(data);
    saveSearch(lat, lon, `${data.location.name}, ${data.location.country}`);
    loadSearchHistory();
  } catch (err) {
    toggleLoading(false);
    showToast(err.message, 'error');
  }
};

// Form Submit
weatherForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const lat = parseFloat(latitudeInput.value);
  const lon = parseFloat(longitudeInput.value);
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    showToast('Inserisci coordinate valide.', 'warning');
    return;
  }
  fetchWeatherData(lat, lon);
});

// Geolocation
window.getLocation = () => {
  if (!navigator.geolocation) return showToast('La geolocalizzazione non è supportata.', 'warning');

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      latitudeInput.value = coords.latitude;
      longitudeInput.value = coords.longitude;
      fetchWeatherData(coords.latitude, coords.longitude);
    },
    (error) => {
      const messages = {
        1: 'Permesso di geolocalizzazione negato.',
        2: 'Informazioni sulla posizione non disponibili.',
        3: 'Timeout nel tentativo di ottenere la posizione.'
      };
      showToast(messages[error.code] || 'Errore di geolocalizzazione.', 'warning');
    }
  );
};

// Search History
const getSearchHistory = () => JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];

const saveSearch = (lat, lon, location) => {
  let history = getSearchHistory();
  const existsIndex = history.findIndex(item => item.lat === lat && item.lon === lon);
  if (existsIndex !== -1) history.splice(existsIndex, 1);
  history.unshift({ lat, lon, location, timestamp: Date.now() });
  if (history.length > MAX_HISTORY_ITEMS) history.pop();
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
};

const loadSearchHistory = () => {
  historyList.innerHTML = '';
  getSearchHistory().forEach(({ lat, lon, location }) => {
    const btn = document.createElement('button');
    btn.textContent = location;
    btn.className = 'history-item';
    btn.addEventListener('click', () => {
      latitudeInput.value = lat;
      longitudeInput.value = lon;
      fetchWeatherData(lat, lon);
    });
    const li = document.createElement('li');
    li.appendChild(btn);
    historyList.appendChild(li);
  });
};

// Theme Management
const getCurrentTheme = () => localStorage.getItem(THEME_KEY) || LIGHT_THEME;

const setTheme = (theme) => {
  body.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeButton();
};

const toggleTheme = () => setTheme(getCurrentTheme() === LIGHT_THEME ? DARK_THEME : LIGHT_THEME);

const updateThemeButton = () => {
  const isDark = getCurrentTheme() === DARK_THEME;
  const icon = themeToggle.querySelector('i');
  icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  themeToggle.setAttribute('aria-label', `Cambia a tema ${isDark ? 'chiaro' : 'scuro'}`);
};

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadSearchHistory();
  setTheme(getCurrentTheme());
  themeToggle.addEventListener('click', toggleTheme);
});
