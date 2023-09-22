import { SlashCommandBuilder, Collection } from 'discord.js';
import {
	subCommandExecutor,
	subCommandAutocomplete,
} from '@/utils/executor.js';

export const data = new SlashCommandBuilder()
	.setName('timer')
	.setDescription('Timer related commands')
	.setDMPermission(false)
	.setNSFW(false);

export const execute = async (interaction) => {
	// Execute the sub command
	await subCommandExecutor(interaction, subCommands);
};

export const autocomplete = async (interaction) => {
	// Execute the sub command autocomplete
	await subCommandAutocomplete(interaction, subCommands);
};

export const subCommands = new Collection();
