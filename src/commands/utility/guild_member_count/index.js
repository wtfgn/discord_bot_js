import {
	Collection,
	SlashCommandBuilder,
	PermissionFlagsBits,
} from 'discord.js';
import { subCommandExecutor } from '@/utils/executor.js';

export const data = new SlashCommandBuilder()
	.setName('guild_member_count')
	.setDescription('Guild members management')
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const execute = async (interaction) => {
	await subCommandExecutor(interaction, subCommands);
};

export const subCommands = new Collection();
