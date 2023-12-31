import { SlashCommandSubcommandBuilder, inlineCode } from 'discord.js';
import { Alarms } from '@/schemas/alarms.js';
import dayjs from 'dayjs';
import { logger } from '@/services/logger.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('add')
	.setDescription('Set an alarm!')
	.addIntegerOption((option) =>
		option
			.setName('hour')
			.setDescription('The hour of the alarm')
			.setMinValue(0)
			.setMaxValue(23)
			.setRequired(true),
	)
	.addIntegerOption((option) =>
		option
			.setName('minute')
			.setDescription('The minute of the alarm')
			.setMinValue(0)
			.setMaxValue(59),
	)
	.addIntegerOption((option) =>
		option
			.setName('month')
			.setDescription('The month of the alarm')
			.setMaxValue(12)
			.setMinValue(1),
	)
	.addIntegerOption((option) =>
		option
			.setName('day')
			.setDescription('The day of the alarm')
			.setMaxValue(31)
			.setMinValue(1),
	)
	.addStringOption((option) =>
		option.setName('message').setDescription('The message of the alarm'),
	)
	.addChannelOption((option) =>
		option
			.setName('channel')
			.setDescription('The channel to send the alarm to'),
	);

export const execute = async (interaction) => {
	const { locale, options, user, guildId } = interaction;
	const hour = options.getInteger('hour');
	const minute = options.getInteger('minute') ?? 0;
	const year = dayjs().year();
	// If month is not specified, use the current month, otherwise use the specified month - 1
	const month = (options.getInteger('month') ?? dayjs().month() + 1) - 1;
	const day = options.getInteger('day') ?? dayjs().date();
	const message = options.getString('message') ?? 'Alarm!';
	const channel = options.getChannel('channel') ?? interaction.channel;

	const time = dayjs()
		.locale(locale)
		.year(year)
		.month(month)
		.date(day)
		.hour(hour)
		.minute(minute)
		.second(0)
		.millisecond(0);

	// Check if the time is in the past
	if (time.isBefore(dayjs())) {
		logger.debug(
			`User <${
				interaction.user.username
			}> tried to set an alarm in the past <${time.format(
				'YYYY-MM-DD HH:mm:ss',
			)}>`,
		);
		return interaction.reply({
			content: `The time you specified is in the past!\nPlease specify a time after ${inlineCode(
				dayjs().format('YYYY-MM-DD HH:mm:ss'),
			)}`,
			ephemeral: true,
		});
	}

	// Create the alarm
	await Alarms.create({
		guildId,
		userId: user.id,
		channelId: channel.id,
		message,
		time,
	});

	await interaction.reply({
		content: `Alarm set for ${inlineCode(
			time.format('YYYY-MM-DD HH:mm:ss'),
		)} in <#${channel.id}>`,
		ephemeral: true,
	});
};
