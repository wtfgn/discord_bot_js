import { Events } from 'discord.js';
// import { Guild } from '../../schemas/guilds';
import { sequelize } from '@/index.js';
import { checkAlarm } from '@/commands/utility/alarm/check_alarm.js';
import { useAppStore } from '@/store/app.js';
import axios from 'axios';

export const data = {
	name: Events.ClientReady,
	once: true,
};

export const execute = async client => {
	const appStore = useAppStore();

	// Sync all defined models to the DB  (this will create the tables)
	// When under development:
	// Use { force: true } to drop all tables and recreate them
	// Use { alter: true } to alter the tables to fit the models
	await sequelize.sync({ alter: true });

	// Fetch cards data
	const cardsData = await axios.get('https://svgdb.me/api/en').then(res => res.data);
	// Set cards data to app store
	appStore.cardsData = cardsData;

	// Check for alarms every 5 seconds
	setInterval(() => checkAlarm(client), 5000);

	console.log(`Ready! Logged in as ${client.user.tag}`);
};