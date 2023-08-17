import { SlashCommandBuilder, Collection } from 'discord.js';
import { subCommandExecutor } from '@/utils/executor.js';

export const data = new SlashCommandBuilder()
	.setName('alarm')
	.setDescription('Set an alarm!');

export const execute = async (interaction) => {
	await subCommandExecutor(interaction, subCommands);
};

export const subCommands = new Collection();
