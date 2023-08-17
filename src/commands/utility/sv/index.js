import { SlashCommandBuilder, Collection } from 'discord.js';
import { subCommandExecutor, subCommandAutocomplete } from '@/utils/executor.js';

export const data = new SlashCommandBuilder()
	.setName('sv')
	.setDescription('Welcome to Shadowverse!');

export const execute = async (interaction) => {
	await subCommandExecutor(interaction, subCommands);
};

export const autocomplete = async (interaction) => {
	await subCommandAutocomplete(interaction, subCommands);
};

export const subCommands = new Collection();
