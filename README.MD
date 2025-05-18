# 🌤️ Meteo 

Un'applicazione meteo moderna e responsive per ottenere previsioni meteorologiche in tempo reale utilizzando coordinate geografiche.

## 🚀 Funzionalità

- 🔍 Ricerca meteo per coordinate GPS
- 📍 Geolocalizzazione automatica
- 🌗 Toggle tema chiaro/scuro
- 🕑 Cronologia ricerche (fino a 5 voci)
- 📱 Design responsive
- 📌 Notifiche toast interattive

## 🛠️ Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3 (con variabili custom), JavaScript ES6
- **API**: [Open-Meteo](https://open-meteo.com/) per i dati meteorologici
- **Icone**: Font Awesome 6
- **Hosting**: Compatibile con qualsiasi static web host

## ⚙️ Installazione

1. Clona il repository:
```bash
git https://github.com/YRNMAMA/PROGETTO-METEO
cd Progetto meteo 
```

2. Apri il file `index.html` nel tuo browser preferito.

## 📖 Utilizzo

1. Inserisci latitudine e longitudine:
   - Formato decimale (es. 45.4642 per Milano)
   - Range consentiti: Latitudine (-90 a 90), Longitudine (-180 a 180)

2. Opzioni alternative:
   - Clicca 🎯 "Posizione attuale" per usare la geolocalizzazione
   - Seleziona dalla cronologia per riutilizzare coordinate precedenti

3. Risultati visualizzati:
   - Temperatura corrente
   - Umidità
   - Velocità del vento
   - Copertura nuvolosa
   - Precipitazioni

## 🌐 Dettagli API

Utilizza l'endpoint `forecast` di Open-Meteo con i seguenti parametri:
```javascript
{
  current: 'temperature_2m,relative_humidity_2m,precipitation,rain,cloud_cover,wind_speed_10m,weather_code',
  timezone: 'auto'
}
```

## 🎨 Personalizzazione

Modifica le variabili CSS nel file `styles.css` per personalizzare:
```css
:root {
  --primary-color: #2196f3;
  --background-light: #f4f6f8;
  --text-dark: #2c3e50;
}
```

## 📝 Note Sviluppo

- Lo stato dell'applicazione viene persistito in `localStorage`
- Gestione errori completa per:
  - Coordinate invalide
  - Errori API
  - Permessi geolocalizzazione
- Accessibilità ARIA implementata
- Ottimizzato per prestazioni (98+ Lighthouse)

## 🤝 Contributi

I contributi sono benvenuti! Apri una issue o una PR per:
- Aggiungere nuove feature
- Migliorare l'accessibilità
- Tradurre l'interfaccia
- Ottimizzare le prestazioni

## 📄 Licenza

Distribuito con licenza MIT. Vedi `LICENSE` per dettagli.