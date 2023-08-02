import { SlashCommandBuilder } from 'discord.js';

export const command = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!');

export const execute = async (interaction) => {
	await interaction.reply(`Pong! ${interaction.client.ws.ping}ms, This command is run by ${interaction.user.username}`);
};