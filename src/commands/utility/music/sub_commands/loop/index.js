import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { notInSameVoiceChannel } from '@/utils/validator/voice_channel_validator.js';
import { queueDoesNotExist } from '@/utils/validator/queue_validator.js';
import { embedOptions } from '#/config/config.json';
import { logger } from '@/services/logger.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('loop')
	.setDescription('Toggle looping a track, the whole queue or autoplay.')
	.addStringOption(option =>
		option
			.setName('mode')
			.setDescription('Provide the mode to loop')
			.setRequired(false)
			.addChoices(
				{ name: 'Track', value: '1' },
				{ name: 'Queue', value: '2' },
				{ name: 'Autoplay', value: '3' },
				{ name: 'Disable', value: '0' },
			));

export const execute = async (interaction) => {
	await interaction.deferReply({ ephemeral: true });

	const { guild, member, user } = interaction;
	const queue = useQueue(guild.id);

	// Check if the queue exists
	if (await queueDoesNotExist(interaction, queue)) return;

	// Check if the user is in the same voice channel as the bot
	if (await notInSameVoiceChannel(interaction, queue)) return;

	const loopModesFormatted = new Map([
		[0, 'disabled'],
		[1, 'track'],
		[2, 'queue'],
		[3, 'autoplay'],
	]);

	const mode = parseInt(interaction.options.getString('mode'));
	const modeUserString = loopModesFormatted.get(mode);
	const currentMode = queue.repeatMode;
	const currentModeUserString = loopModesFormatted.get(currentMode);

	// If no mode is provided, return the current loop mode
	if (!mode && mode !== 0) {
		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.info)
			.setDescription(
				`**${
					currentMode === 3 ? embedOptions.icons.autoplay : embedOptions.icons.loop
				} Current loop mode**\nThe looping mode is currently set to \`${currentModeUserString}\`.`,
			);
		return interaction.editReply({ embeds: [embed] });
	}

	// If the mode is same as current mode, return
	if (mode === currentMode) {
		logger.debug(`User <${interaction.user.username}> tried to use <${interaction.commandName}> command with the same loop mode`);

		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.warning)
			.setDescription(
				`**${embedOptions.icons.warning} Oops!**\nLoop mode is already \`${modeUserString}\`.`,
			);
		return interaction.editReply({ embeds: [embed] });
	}

	// Set the loop mode
	queue.setRepeatMode(mode);

	// If the mode is not set to the provided mode, return
	if (!queue.repeatMode === mode) {
		logger.debug(`User <${interaction.user.username}> tried to use <${interaction.commandName}> command with the same loop mode`);

		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.error)
			.setDescription(
				`**${embedOptions.icons.error} Uh-oh... Failed to change loop mode!**\nI tried to change the loop mode to \`${modeUserString}\`, but something went wrong.\n\nYou can try to perform the command again.`,
			);
		return interaction.editReply({ embeds: [embed] });
	}

	let embedDescription = '';
	const embed = new EmbedBuilder()
		.setAuthor({
			name: member.nickname || user.username,
			iconURL: user.avatarURL(),
		})
		.setColor(embedOptions.colors.success);

	switch (mode) {
		case 0:
			embedDescription = `**${embedOptions.icons.success} Loop mode disabled**\nChanging loop mode from \`${currentModeUserString}\` to \`${modeUserString}\`.\n\nThe ${currentModeUserString} will no longer play on repeat!`;
			break;
		case 1:
			embedDescription = `**${embedOptions.icons.success} Looping track**\nChanging loop mode from \`${currentModeUserString}\` to \`${modeUserString}\`.\n\nThe current track will now play on repeat!`;
			break;
		case 2:
			embedDescription = `**${embedOptions.icons.success} Looping queue**\nChanging loop mode from \`${currentModeUserString}\` to \`${modeUserString}\`.\n\nThe queue will now play on repeat!`;
			break;
		case 3:
			embedDescription = `**${embedOptions.icons.success} Looping autoplay**\nChanging loop mode from \`${currentModeUserString}\` to \`${modeUserString}\`.\n\nAutoplay will play similar tracks to the current track, when the queue is empty.`;
			break;
		default:
			break;
	}

	embed.setDescription(embedDescription);

	return interaction.editReply({ embeds: [embed] });
};

