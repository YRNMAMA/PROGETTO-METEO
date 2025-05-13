// Configurazione API Open-Meteo
const API_URL = 'https://api.open-meteo.com/v1/forecast';

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

// Render Open-Meteo Data
const renderOpenMeteoData = (data, lat, lon) => {
  toggleLoading(false);
  const current = data.current;

  weatherInfoSection.innerHTML = `
    <div class="weather-card current-weather">
      <h3>Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}</h3>
      <div class="weather-details">
        <p class="temperature">${current.temperature_2m}°C</p>
        <p class="condition">Codice Meteo: ${current.weather_code}</p>
      </div>
      <div class="additional-info">
        <p>Vento: ${current.wind_speed_10m} km/h</p>
        <p>Umidità: ${current.relative_humidity_2m}%</p>
        <p>Pioggia: ${current.rain} mm</p>
        <p>Nuvole: ${current.cloud_cover}%</p>
      </div>
    </div>
  `;
};

// Fetch dati da Open-Meteo
const fetchWeatherData = async (lat, lon) => {
  toggleLoading(true);
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,precipitation,rain,cloud_cover,wind_speed_10m,weather_code',
    timezone: 'auto'
  });

  try {
    const response = await fetch(`${API_URL}?${params}`);
    const data = await response.json();
    if (!response.ok) throw new Error('Errore nel recupero dei dati meteo');
    renderOpenMeteoData(data, lat, lon);
    saveSearch(lat, lon, `${lat.toFixed(2)}, ${lon.toFixed(2)}`);
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
