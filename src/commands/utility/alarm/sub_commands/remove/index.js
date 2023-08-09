import { SlashCommandSubcommandBuilder, inlineCode } from 'discord.js';
import { Alarms } from '@/schemas/alarms.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('remove')
	.setDescription('Remove an alarm!')
	.addIntegerOption(option =>
		option
			.setName('id')
			.setDescription('The id of the alarm to remove')
			.setRequired(true));

export const execute = async (interaction) => {
	const { options, guildId } = interaction;
	const id = options.getInteger('id');

	// Find the alarm with the specified id
	const alarm = await Alarms.findOne({ where: { id, guildId } });

	// If the alarm does not exist, send a message
	if (!alarm) {
		return interaction.reply({
			content: `Alarm with id ${inlineCode(id)} does not exist!\nPlease use the ${inlineCode('/alarm list')} command to view all alarms!`,
			ephemeral: true,
		});
	}

	// If the user is not the owner of the alarm, send a message
	if (alarm.userId !== interaction.member.id) {
		return interaction.reply({
			content: `You are not the owner of alarm with id ${inlineCode(id)}!\nPlease use the ${inlineCode('/alarm list')} command to view all alarms!`,
			ephemeral: true,
		});
	}

	// Delete the alarm
	await alarm.destroy();

	// Reply with a success message
	return interaction.reply({
		content: `Alarm with id ${inlineCode(id)} has been removed!`,
		ephemeral: true,
	});
};