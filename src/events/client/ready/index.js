import { Events } from 'discord.js';
import { sequelize } from '@/index.js';
import { checkAlarm } from '@/commands/utility/alarm/check_alarm.js';
import { useAppStore } from '@/store/app.js';
import { request } from 'undici';

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

	// .on('debug', console.log)
	// .on('debug', (queue, message) => console.log(`[DEBUG ${queue.guild.id}] ${message}`));


	// Fetch cards data
	try {
		const cardsData = await request('https://svgdb.me/api/en').then(res => res.body.json());
		// Set cards data to app store
		appStore.cardsData = cardsData;
	}
	catch (err) {
		console.error(err);
	}

	// Check for alarms every 5 seconds, do not hang the event loop
	setInterval(() => {
		checkAlarm(client);
	}, 5000);

	console.log(`Ready! Logged in as ${client.user.tag}`);
};