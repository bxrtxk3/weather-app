import React, { useState, useEffect, useCallback } from "react";

const Home: React.FC = () => {
  const API_KEY = import.meta.env.VITE_APP_API_KEY;
  const GEO_API_BASE_URL = "http://api.openweathermap.org/geo/1.0/direct";
  const WEATHER_API_BASE_URL =
    "https://api.openweathermap.org/data/2.5/weather";

  const [searchString, setSearchString] = useState("London");
  const [location, setLocation] = useState("London");
  const [lat, setLat] = useState(51.507359);
  const [lon, setLon] = useState(-0.136439);
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);

  const fetchGeolocation = useCallback(async () => {
    const response = await fetch(
      `${GEO_API_BASE_URL}?q=${searchString}&appid=${API_KEY}`
    );
    const data = await response.json();
    setLat(data[0].lat);
    setLon(data[0].lon);
    setLocation(`${data[0].name}, ${data[0].country}`);
  }, [searchString, API_KEY]);

  const fetchWeatherData = useCallback(async () => {
    const response = await fetch(
      `${WEATHER_API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    if (response.status !== 200) {
      throw new Error("Error fetching weather data from the API");
    }
    setTemperature(data.main.temp);
    setHumidity(data.main.humidity);
  }, [lat, lon, API_KEY]);

  useEffect(() => {
    fetchGeolocation();
    fetchWeatherData();
  }, [location]);

  return (
    <div>
      <h1>Weather App</h1>
      <input
        type="text"
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
      />
      <button
        onClick={() => {
          fetchGeolocation();
          fetchWeatherData();
        }}
      >
        Fetch Weather
      </button>
      {temperature && <p>Temperature: {temperature}°C</p>}
      {humidity && <p>Humidity: {humidity}%</p>}
    </div>
  );
};

export default Home;
