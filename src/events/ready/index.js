import { Events } from 'discord.js';
// import { Guild } from '../../schemas/guilds';
import { sequelize } from '@/index.js';

export const data = {
	name: Events.ClientReady,
	once: true,
};

export const execute = async client => {
	// Sync all defined models to the DB  (this will create the tables)
	// When under development:
	// Use { force: true } to drop all tables and recreate them
	// Use { alter: true } to alter the tables to fit the models
	await sequelize.sync();
	console.log(`Ready! Logged in as ${client.user.tag}`);
};