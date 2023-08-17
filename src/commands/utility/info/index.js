import { Collection, SlashCommandBuilder } from 'discord.js';
import { subCommandExecutor } from '@/utils/executor.js';

export const data = new SlashCommandBuilder()
	.setName('info')
	.setDescription('Info about a user or a server');

export const execute = async (interaction) => {
	await subCommandExecutor(interaction, subCommands);
};

export const subCommands = new Collection();

export const cooldown = 5;