import React, { useState, useEffect } from "react";

const Home: React.FC = () => {
  // Constants
  const API_KEY = import.meta.env.VITE_APP_API_KEY;
  const DEFAULT_LOCATION = 'London';
  const WEATHER_API_BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [searchString, setSearchString] = useState("London");
  const [location, setLocation] = useState('');
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);

  // Fetch weather data for a given URL
  const fetchWeatherData = async (url: string) => {
    setLoading(true);
    setError(null); // Reset the error state
    try {
      const response = await fetch(url);
      if (!response.ok) {
        // Check if the status is 404 and display a specific message
        if (response.status === 404) {
          throw new Error('Location not found');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      const data = await response.json();
      setLocation(data.name);
      setSearchString('');
      setTemperature(data.main.temp);
      setHumidity(data.main.humidity);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Callback for successful geolocation
  const successCallback = async (position: GeolocationPosition) => {
    const url = `${WEATHER_API_BASE_URL}?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${API_KEY}&units=metric`;
    try {
      await fetchWeatherData(url);
    } catch (error) {
      // Handle network errors
      if (error instanceof Error) {
        setError(`Network error: ${error.message}`);
      }
    }
  };

  // Callback for failed geolocation
  const errorCallback = async () => {
    const url = `${WEATHER_API_BASE_URL}?q=${DEFAULT_LOCATION}&appid=${API_KEY}&units=metric`;
    try {
      await fetchWeatherData(url);
    } catch (error) {
      // Handle network errors
      if (error instanceof Error) {
        setError(`Network error: ${error.message}`);
      }
    }
  };

  // Fetch weather data on component mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  }, []);

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const url = `${WEATHER_API_BASE_URL}?q=${searchString}&appid=${API_KEY}&units=metric`;
          try {
            await fetchWeatherData(url);
          } catch (error) {
            if (error instanceof Error) {
              setError(error.message);
            }
          }
        }}
      >
        <input
          type="text"
          value={searchString}
          placeholder="Enter a location"
          onChange={(e) => setSearchString(e.target.value)}
        />
        <button type="submit">Fetch Weather</button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div>
          <p>Location: {location}</p>
          <p>Temperature: {temperature}°C</p>
          <p>Humidity: {humidity}%</p>
        </div>
      )}
    </div>
  );
};

export default Home;
