import { Events } from 'discord.js';
import { sequelize } from '@/index.js';
import { checkAlarm } from '@/commands/utility/alarm/check_alarm.js';
import { useAppStore } from '@/store/app.js';
import { request } from 'undici';
import { logger } from '@/services/logger.js';

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
	try {
		await sequelize.sync({ alter: true });
		logger.info('Successfully synced models to the database');
	}
	catch (error) {
		logger.error('Failed to sync models to the database', error);
	}

	// Fetch cards data
	try {
		const cardsData = await request('https://svgdb.me/api/en').then(res => res.body.json());
		// Set cards data to app store
		appStore.cardsData = cardsData;
	}
	catch (error) {
		logger.error('Failed to fetch cards data', error);
	}

	// Check for alarms every 5 seconds, do not hang the event loop
	setInterval(() => {
		checkAlarm(client);
	}, 5000);

	logger.info(`Logged in as ${client.user.tag}!`);
};