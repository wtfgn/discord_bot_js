import {
	SlashCommandSubcommandBuilder,
	EmbedBuilder,
	ChannelType,
	inlineCode,
} from 'discord.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import { embedOptions } from '#/config/config.json';
import { useAppStore } from '@/store/app.js';
import { logger } from '@/services/logger.js';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);

export const data = new SlashCommandSubcommandBuilder()
	.setName('add')
	.setDescription('Set a timer!')
	.addIntegerOption((option) =>
		option
			.setName('hours')
			.setDescription('The hours of the timer')
			.setMinValue(0)
			.setMaxValue(100)
			.setRequired(true),
	)
	.addIntegerOption((option) =>
		option
			.setName('minutes')
			.setDescription('The minutes of the timer')
			.setMinValue(0)
			.setMaxValue(59)
			.setRequired(true),
	)
	.addIntegerOption((option) =>
		option
			.setName('seconds')
			.setDescription('The seconds of the timer')
			.setMinValue(0)
			.setMaxValue(59)
			.setRequired(true),
	)
	.addBooleanOption((option) =>
		option
			.setName('repeat')
			.setDescription('Whether to repeat the timer')
			.setRequired(false),
	)
	.addChannelOption((option) =>
		option
			.setName('channel')
			.setDescription('The channel to send the timer to')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(false),
	);

export const execute = async (interaction) => {
	const appStore = useAppStore();
	const { options, user } = interaction;
	const hours = options.getInteger('hours') ?? 0;
	const minutes = options.getInteger('minutes') ?? 0;
	const seconds = options.getInteger('seconds') ?? 0;
	const repeat = options.getBoolean('repeat') ?? false;
	const channel = options.getChannel('channel') ?? interaction.channel;

	const time = dayjs()
		.add(hours, 'hour')
		.add(minutes, 'minute')
		.add(seconds, 'second');

	// Check if the time is valid
	if (!time.isAfter(dayjs())) {
		logger.debug(
			`User ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) tried to set a timer with hours, minutes and seconds all 0.`,
		);

		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.error)
			.setDescription(
				`**${embedOptions.icons.error} Hours, minutes and seconds are all 0!**`,
			);
		return interaction.reply({ embeds: [embed] });
	}

	const timerExists = appStore.timers.has(interaction.user.id);
	const previousTimer = appStore.timers.get(interaction.user.id);
	// Clear the timer if it exists
	if (timerExists) {
		logger.debug(
			`User ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) cleared their timer because they set a new one.`,
		);

		try {
			clearInterval(previousTimer);
			appStore.timers.delete(user.id);
		} catch (error) {
			logger.error(
				`User ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) tried to clear their timer, but there was an error: ${error.message}`,
			);
		}
	}

	// Repeat timer
	if (repeat) {
		logger.debug(
			`User ${interaction.user.username}#${interaction.user.discriminator} (${
				interaction.user.id
			}) set a repeating timer for ${time.diff(
				dayjs(),
			)}ms with repeat set to true.`,
		);

		const repeatTimer = setInterval(async () => {
			const repeatEmbed = new EmbedBuilder()
				.setColor(embedOptions.colors.success)
				.setDescription(
					`**${
						embedOptions.icons.success
					} ${user} Hey! Your timer has finished!**\n${
						repeat ? inlineCode('The timer will repeat.') : ''
					}`,
				);
			await channel.send({ embeds: [repeatEmbed] });
		}, time.diff(dayjs()));

		// Set the timer in the store
		appStore.timers.set(interaction.user.id, repeatTimer);
	}

	// Non-repeating timer
	else {
		logger.debug(
			`User ${interaction.user.username}#${interaction.user.discriminator} (${
				interaction.user.id
			}) set a timer for ${time.diff(dayjs())}ms with repeat set to false.`,
		);

		// Set the timer
		const timer = setTimeout(async () => {
			// Delete the timer from the store
			try {
				if (appStore.timers.has(interaction.user.id)) {
					appStore.timers.delete(interaction.user.id);
				} else {
					logger.debug(
						`User ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) tried to delete their timer, but it was already deleted.`,
					);
				}
			} catch {
				logger.debug(
					`User ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) tried to delete their timer, but something went wrong.`,
				);
			}

			const embed = new EmbedBuilder()
				.setColor(embedOptions.colors.success)
				.setDescription(
					`**${
						embedOptions.icons.success
					} ${user} Hey! Your timer has finished!**\n${
						repeat ? inlineCode('The timer will repeat.') : ''
					}`,
				);
			await channel.send({ embeds: [embed] });
		}, time.diff(dayjs()));

		// Set the timer in the store
		appStore.timers.set(interaction.user.id, timer);
	}

	// Reply to the interaction
	const embed = new EmbedBuilder()
		.setColor(embedOptions.colors.success)
		.setDescription(
			`**${
				embedOptions.icons.success
			} ${user} Timer set for ${time.fromNow()} with repeat set to ${inlineCode(
				repeat ? 'true' : 'false',
			)}!\n${timerExists ? 'Your previous timer has been cleared.' : ''}**`,
		);

	return interaction.reply({ embeds: [embed] });
};
