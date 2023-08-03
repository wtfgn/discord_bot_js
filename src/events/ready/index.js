import { Events } from 'discord.js';

export const data = {
	name: Events.ClientReady,
	once: true,
};

export const execute = async client => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
};