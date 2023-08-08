import { SlashCommandSubcommandBuilder } from 'discord.js';
import { Alarms } from '@/schemas/alarms.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('list')
	.setDescription('List all alarms!');

export const execute = async (interaction) => {
	const { guildId, member } = interaction;

	// Find all alarms for the guild
	const alarms = await Alarms.findAll({
		where: {
			guildId,
			userId: member.id,
		},
	});

	// Reply with a list of all alarms
	return interaction.reply(`Alarms:\n${alarms.map(alarm => alarm.dataValues.id).join('\n')}`);
};