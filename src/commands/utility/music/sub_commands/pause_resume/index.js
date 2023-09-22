import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { notInSameVoiceChannel } from '@/utils/validator/voice_channel_validator.js';
import {
	queueDoesNotExist,
	queueNoCurrentTrack,
} from '@/utils/validator/queue_validator.js';
import { embedOptions } from '#/config/config.json';
import { logger } from '@/services/logger.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('pause_resume')
	.setDescription('Pause or resume the current track');

export const execute = async (interaction) => {
	// Defer the reply to the interaction
	await interaction.deferReply({ ephemeral: true });

	const { guild, member, user } = interaction;
	const queue = useQueue(guild.id);

	// Check if the queue exists
	if (await queueDoesNotExist(interaction, queue)) return;

	// Check if the user is in the same voice channel as the bot
	if (await notInSameVoiceChannel(interaction, queue)) return;

	// Check if the queue is empty
	if (await queueNoCurrentTrack(interaction, queue)) return;

	const durationFormat =
		queue.currentTrack.raw.duration === 0 ||
		queue.currentTrack.duration === '0:00'
			? ''
			: `\`${queue.currentTrack.duration}\``;

	// change paused state to opposite of current state
	queue.node.setPaused(!queue.node.isPaused());

	logger.debug(
		`User ${user.username}#${user.discriminator} (${user.id}) ${
			queue.node.isPaused() ? 'paused' : 'resumed'
		} the track in guild ${guild.name} (${guild.id}).`,
	);

	const embed = new EmbedBuilder()
		.setAuthor({
			name: member.nickname || user.username,
			iconURL: user.avatarURL(),
		})
		.setColor(embedOptions.colors.success)
		.setThumbnail(queue.currentTrack.thumbnail)
		.setDescription(
			`**${embedOptions.icons.pauseResumed} ${
				queue.node.isPaused() ? 'Paused Track' : 'Resumed track'
			}**\n**${durationFormat} [${queue.currentTrack.title}](${
				queue.currentTrack.url
			})**`,
		);

	return interaction.editReply({ embeds: [embed] });
};
