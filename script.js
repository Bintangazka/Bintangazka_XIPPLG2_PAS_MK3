// Mengambil elemen-elemen dari halaman HTML
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

// Ganti dengan kunci API OpenWeatherMap Anda sendiri
const API_KEY = "c50e8e9d3a5dcb8085eaf5e1ee7ff375"; // Kunci API untuk OpenWeatherMap API

// Fungsi untuk membuat struktur HTML untuk kartu cuaca
const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) { // HTML untuk kartu cuaca utama
        return `<div class="details"> 
                    <!-- Menampilkan detail cuaca utama -->
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <!-- Menampilkan ikon cuaca dan deskripsi -->
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { // HTML untuk kartu ramalan lima hari ke depan
        return `<li class="card">
                    <!-- Menampilkan detail ramalan lima hari ke depan -->
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}


// Fungsi untuk mengambil detail cuaca dari OpenWeatherMap API
const getWeatherDetails = (cityName, latitude, longitude) => {

    // Membuat URL API untuk mendapatkan ramalan cuaca
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    // Mengambil data cuaca dan memprosesnya
    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Memfilter ramalan untuk mendapatkan satu ramalan per hari
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Menghapus data cuaca sebelumnya
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Membuat kartu cuaca berdasarkan data ramalan
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

// Fungsi untuk mendapatkan koordinat kota berdasarkan masukan pengguna
const getCityCoordinates = () => {

    // Mengambil nama kota yang dimasukkan dari input
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Masukkan koordinat kota (lintang, bujur, dan nama) dari respons API
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

// Fungsi untuk mendapatkan koordinat pengguna menggunakan geolocation API
const getUserCoordinates = () => {

    // Meminta geolokasi pengguna
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // mendapat koordinat dari pengguna

            // Mendapatkan koordinat pengguna dan mengambil nama kota berdasarkan koordinat
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { // Tampilkan peringatan jika pengguna menolak izin lokasi
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

// Event listener untuk tombol lokasi, tombol cari, dan tombol 'Enter'
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());