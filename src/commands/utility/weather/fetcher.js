import axios from 'axios';

export const fetchWeatherData = async (city) => {
	const url = 'https://api.openweathermap.org/data/2.5/weather';
	const params = {
		q: city,
		units: 'metric',
		appid: process.env.OPENWEATHER_API_KEY,
	};
	const response = await axios.get(url, { params });
	return response.data;
};