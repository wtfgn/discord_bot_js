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
	if (!alarm) return interaction.reply(`No alarm with that id was found!\n Please use the ${inlineCode('/alarm list')} command to find the id of the alarm you want to remove!`);

	// Delete the alarm
	await alarm.destroy();

	// Reply with a success message
	return interaction.reply(`Alarm with id ${inlineCode(id)} was removed!`);
};