import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('weather')
	.setDescription('Get weather information.');

export const execute = async (interaction) => {
	

	await interaction.reply('This command is under development.');
}