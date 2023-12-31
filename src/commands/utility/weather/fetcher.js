import axios from 'axios';
import { logger } from '@/services/logger.js';

export const fetchWeatherData = async (city) => {
	const url = 'https://api.openweathermap.org/data/2.5/weather';
	const params = {
		q: city,
		units: 'metric',
		appid: process.env.OPENWEATHER_API_KEY,
	};
	let response = null;

	try {
		response = await axios.get(url, { params });
	}
	catch (err) {
		logger.error(err, 'Failed to fetch weather data');
	}

	return response.data;
};
