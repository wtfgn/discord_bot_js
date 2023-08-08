import { Events } from 'discord.js';
// import { Guild } from '../../schemas/guilds';
import { sequelize } from '@/index.js';
import { checkAlarm } from '@/commands/utility/alarm/check_alarm.js';

export const data = {
	name: Events.ClientReady,
	once: true,
};

export const execute = async client => {
	// Sync all defined models to the DB  (this will create the tables)
	// When under development:
	// Use { force: true } to drop all tables and recreate them
	// Use { alter: true } to alter the tables to fit the models
	await sequelize.sync({ force: true });

	// Check for alarms every 5 seconds
	setInterval(() => checkAlarm(client), 5000);

	console.log(`Ready! Logged in as ${client.user.tag}`);
};