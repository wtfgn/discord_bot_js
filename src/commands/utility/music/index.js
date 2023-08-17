import { SlashCommandBuilder, Collection } from 'discord.js';
import { subCommandExecutor, subCommandAutocomplete } from '@/utils/executor.js';
import { notInVoiceChannel } from '@/utils/validator/voice_channel_validator.js';

export const data = new SlashCommandBuilder()
	.setName('music')
	.setDescription('Music related commands')
	.setDMPermission(false)
	.setNSFW(false);

export const execute = async (interaction) => {
	// Check if the user is in a voice channel
	if (await notInVoiceChannel(interaction)) return;

	// Execute the sub command
	await subCommandExecutor(interaction, subCommands);
};

export const autocomplete = async (interaction) => {
	// Check if the user is in a voice channel
	if (await notInVoiceChannel(interaction)) return;

	// Execute the sub command autocomplete
	await subCommandAutocomplete(interaction, subCommands);
};

export const subCommands = new Collection();