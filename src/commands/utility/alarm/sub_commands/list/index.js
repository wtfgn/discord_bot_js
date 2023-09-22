import {
	SlashCommandSubcommandBuilder,
	EmbedBuilder,
	inlineCode,
} from 'discord.js';
import { Alarms } from '@/schemas/alarms.js';
import { logger } from '@/services/logger.js';

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

	// If there are no alarms, send a message
	if (alarms.length === 0) {
		logger.debug(
			`User <${interaction.user.username}> tried to list alarms but there were none`,
		);
		return interaction.reply({
			content: `You have no alarms set!\nPlease use the ${inlineCode(
				'/alarm add',
			)} command to set an alarm!`,
			ephemeral: true,
		});
	}

	// Create an embed with all alarms
	const embed = new EmbedBuilder()
		.setTitle('Your alarms')
		.setColor('#00ff00')
		.setTimestamp()
		.setAuthor({
			name: member.user.username,
			iconURL: member.user.avatarURL(),
		})
		.setDescription('Here are all your alarms!');

	alarms.forEach((alarm) => {
		const { id, time, message } = alarm.dataValues;
		embed.addFields({
			name: `Alarm ID: ${id}`,
			value: `Time: ${time.toLocaleString()}\nMessage: ${message}`,
		});
	});

	interaction.reply({ embeds: [embed], ephemeral: true });
};
