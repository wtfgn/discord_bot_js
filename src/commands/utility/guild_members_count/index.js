import { Collection, SlashCommandBuilder } from 'discord.js';
import { subCommandExecutor } from '@/core/executor.js';

export const data = new SlashCommandBuilder()
	.setName('guild_members_count')
	.setDescription('Guild members management')
	.setDMPermission(false);

export const execute = async (interaction) => {
	await subCommandExecutor(interaction, subCommands);
};

export const subCommands = new Collection();