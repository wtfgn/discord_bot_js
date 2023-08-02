import { SlashCommandBuilder } from 'discord.js';

export const command = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!');

export const execute = async (interaction) => {
	// Reply with Pong!
	await interaction.reply('Pong!');
};