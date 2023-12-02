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
  const [country, setCountry] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [feelsLike, setFeelsLike] = useState<number | null>(null);
  const [pressure, setPressure] = useState<number | null>(null);
  const [windSpeed, setWindSpeed] = useState<number | null>(null);
  const [windDirection, setWindDirection] = useState<number | null>(null);
  const [visibility, setVisibility] = useState<number | null>(null);
  const [sunrise, setSunrise] = useState<number | null>(null);
  const [sunset, setSunset] = useState<number | null>(null);
  const [timeZone, setTimeZone] = useState<number | null>(null);
  const [iconCode, setIconCode] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);


  // Convert wind direction in degrees to cardinal direction
  const getWindDirection = (deg: number) => {
    const directions = ['North', 'North East', 'East', 'South East', 'South', 'South West', 'West', 'North West'];
    const value = Math.floor((deg / 45) + 0.5);
    return directions[value % 8];
  };


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

      // Set the icon code
      if (data.weather && data.weather.length > 0) {
        setIconCode(data.weather[0].icon);
      }
      console.log(data);
      setLocation(data.name);
      setCountry(data.sys.country);
      setDescription(data.weather[0].description);
      setTemperature(data.main.temp);
      setFeelsLike(data.main.feels_like);
      setHumidity(data.main.humidity);
      setPressure(data.main.pressure);
      setWindSpeed(data.wind.speed);
      setWindDirection(data.wind.deg);
      setVisibility(data.visibility);
      setSunrise(data.sys.sunrise);
      setSunset(data.sys.sunset);
      setTimeZone(data.timezone);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setSearchString('');
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
          <p>Location: {location}{country && `, ${country}`}</p>
          {iconCode && <img src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`} alt="Weather icon" />}
          <p>Description: {description}</p>
          <p>Temperature: {temperature}°C</p>
          <p>Feels Like: {feelsLike}°C</p>
          <p>Humidity: {humidity}%</p>
          <p>Pressure: {pressure} hPa</p>
          <p>Wind Speed: {windSpeed} m/s</p>
          <p>Wind Direction: {windDirection !== null ? getWindDirection(windDirection) : 'N/A'}</p>
          <p>Visibility: {visibility} m</p>
          <p>Sunrise: {sunrise && timeZone ? new Date((sunrise + timeZone) * 1000).toLocaleTimeString() : 'N/A'}</p>
          <p>Sunset: {sunset && timeZone ? new Date((sunset + timeZone) * 1000).toLocaleTimeString() : 'N/A'}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
