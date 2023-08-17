import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { notInSameVoiceChannel } from '@/utils/validator/voice_channel_validator.js';
import { queueDoesNotExist, queueIsEmpty } from '@/utils/validator/queue_validator.js';
import { embedOptions } from '#/config/config.json';
import { logger } from '@/services/logger.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('skip')
	.setDescription('Skip the current track or a specified track')
	.addIntegerOption(option =>
		option
			.setName('track_number')
			.setDescription('Provide the track number to skip')
			.setMinValue(1)
			.setRequired(false));

export const execute = async (interaction) => {
	// Defer the reply to the interaction
	await interaction.deferReply({ ephemeral: true });

	const { guild, member, user, options } = interaction;
	const queue = useQueue(guild.id);
	const skipToTrack = options.getInteger('track_number');

	// Check if the queue exists
	if (await queueDoesNotExist(interaction, queue)) return;

	// Check if the user is in the same voice channel as the bot
	if (await notInSameVoiceChannel(interaction, queue)) return;

	// Check if the queue is empty
	if (await queueIsEmpty(interaction, queue)) return;

	// If the user provided a track number, skip to that track
	if (skipToTrack) {
		// Check if the track number is valid
		if (skipToTrack > queue.tracks.data.length) {
			logger.debug(`User ${user.username} used the skip command with an invalid track number.`);

			const embed = new EmbedBuilder()
				.setColor(embedOptions.colors.warning)
				.setDescription(
					`**${embedOptions.icons.warning} Oops!**\nThere are only \`${queue.tracks.data.length}\` tracks in the queue. You cannot skip to track \`${skipToTrack}\`.\n\nView tracks added to the queue with **\`/music queue\`**.`,
				);
			return interaction.editReply({ embeds: [embed] });
		}
		else {
			// Skip to the track
			const skippedTrack = queue.currentTrack;
			const durationFormat =
				skippedTrack.raw.duration === 0 || skippedTrack.duration === '0:00' ?
					'' :
					`\`${skippedTrack.duration}\``;

			queue.node.skipTo(skipToTrack - 1);

			logger.debug(`User ${user.username} skipped to track ${skipToTrack}.`);

			const embed = new EmbedBuilder()
				.setAuthor({
					name: member.nickname || user.username,
					iconURL: user.displayAvatarURL(),
				})
				.setColor(embedOptions.colors.success)
				.setDescription(
					`**${embedOptions.icons.skipped} Skipped track**\n**${durationFormat} [${skippedTrack.title}](${skippedTrack.url})**`,
				);
			return interaction.editReply({ embeds: [embed] });
		}
	}
	// If the user did not provide a track number
	else {
		// Check if there is any tracks in the queue
		// eslint-disable-next-line no-lonely-if
		if (queue.tracks.data.length === 0 && !queue.currentTrack) {
			logger.debug(`User ${user.username} used the skip command with no tracks in the queue or currently playing.`);

			const embed = new EmbedBuilder()
				.setColor(embedOptions.colors.warning)
				.setDescription(
					`**${embedOptions.icons.warning} Oops!**\nThere is nothing currently playing. First add some tracks with **\`/music play\`**!`,
				);
			return interaction.editReply({ embeds: [embed] });
		}
	}

	// Skip the current track
	const skippedTrack = queue.currentTrack;
	const durationFormat =
		skippedTrack.raw.duration === 0 || skippedTrack.duration === '0:00' ?
			'' :
			`\`${skippedTrack.duration}\``;

	queue.node.skip();

	const loopModesFormatted = new Map([
		[0, 'disabled'],
		[1, 'track'],
		[2, 'queue'],
		[3, 'autoplay'],
	]);

	const loopModeUserString = loopModesFormatted.get(queue.repeatMode);

	logger.debug(`User ${user.username} skipped the current track.`);

	const embed = new EmbedBuilder()
		.setAuthor({
			name: member.nickname || user.username,
			iconURL: user.displayAvatarURL(),
		})
		.setColor(embedOptions.colors.success)
		.setThumbnail(skippedTrack.thumbnail)
		.setDescription(
			`**${embedOptions.icons.skipped} Skipped track**\n**${durationFormat} [${skippedTrack.title}](${skippedTrack.url})**` +
			`${queue.repeatMode === 0
				? ''
				: `\n\n**${queue.repeatMode === 3
					? embedOptions.icons.autoplaying
					: embedOptions.icons.looping
				} Looping**\nLoop mode is set to ${loopModeUserString}. You can change it with **\`/loop\`**.`
			}`,
		);

	return interaction.editReply({ embeds: [embed] });
};