import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import dayjs from 'dayjs';
import { fetchWeatherData } from './fetcher';

export const data = new SlashCommandBuilder()
	.setName('weather')
	.setDescription('Get weather information.')
	.addStringOption(option =>
		option.setName('city')
			.setDescription('The city to get weather information for.')
			.setRequired(true));

export const execute = async (interaction) => {
	const city = interaction.options.getString('city');
	const weatherData = await fetchWeatherData(city);

	if (weatherData.cod === '404') {
		return interaction.reply({
			content: 'City not found!',
			ephemeral: true,
		});
	}

	if (weatherData.cod !== 200) {
		return interaction.reply({
			content: 'Something went wrong!',
			ephemeral: true,
		});
	}

	const embed = new EmbedBuilder()
		.setTitle(`Weather in ${weatherData.name}`)
		.setDescription(
			`Time: ${dayjs.unix(weatherData.dt).format('HH:mm')}
			Date: ${dayjs.unix(weatherData.dt).format('DD/MM/YYYY')}
			Weather: ${weatherData.weather[0].description}`)
		.setThumbnail(`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`)
		.addFields({
			name: ':thermometer:Temperature',
			value:
				`*Current*: ${weatherData.main.temp}°C
				*Feels like*: ${weatherData.main.feels_like}°C
				*Min*: ${weatherData.main.temp_min}°C
				*Max*: ${weatherData.main.temp_max}°C
				*Pressure*: ${weatherData.main.pressure} hPa`,
			inline: true,
		})
		.addFields({
			name: ':dash:Wind',
			value:
				`*Speed*: ${weatherData.wind.speed} m/s
				*Direction*: ${weatherData.wind.deg}°
				*Humidity*: ${weatherData.main.humidity}%`,
			inline: true,
		})
		.addFields({
			name: ':sweat_drops:Humidity',
			value:
				`*Humidity*: ${weatherData.main.humidity}%`,
			inline: true,
		})
		.addFields({
			name: ':cloud:Clouds',
			value:
				`*Cloudiness*: ${weatherData.clouds.all}%`,
			inline: true,
		})
		.addFields({
			name: ':sunny:Sun',
			value:
				`*:sunrise:Sunrise*: ${dayjs.unix(weatherData.sys.sunrise).format('HH:mm')}
				*:city_sunset:Sunset*: ${dayjs.unix(weatherData.sys.sunset).format('HH:mm')}`,
			inline: true,
		})
		.setFooter({
			text: 'Powered by OpenWeatherMap',
			iconURL: 'https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/icons/logo_32x32.png',
		});

	// If rain data is available
	if (weatherData.rain) {
		embed.addFields({
			name: ':cloud_rain:Rain',
			value:
				`*1h*: ${weatherData.rain['1h'] ? weatherData.rain['1h'] : '0'} mm
				*3h*: ${weatherData.rain['3h'] ? weatherData.rain['3h'] : '0'} mm`,
			inline: true,
		});
	}

	// If snow data is available
	if (weatherData.snow) {
		embed.addFields({
			name: ':snowflake:Snow',
			value:
				`*1h*: ${weatherData.snow['1h'] ? weatherData.snow['1h'] : '0'} mm
				*3h*: ${weatherData.snow['3h'] ? weatherData.snow['3h'] : '0'} mm`,
			inline: true,
		});
	}

	await interaction.reply({
		embeds: [embed],
		ephemeral: true,
	});
};