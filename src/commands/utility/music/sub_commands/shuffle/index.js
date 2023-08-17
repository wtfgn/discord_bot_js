import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { notInSameVoiceChannel } from '@/utils/validator/voice_channel_validator.js';
import { queueDoesNotExist, queueIsEmpty } from '@/utils/validator/queue_validator.js';
import { embedOptions } from '#/config/config.json';
import { logger } from '@/services/logger.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('shuffle')
	.setDescription('Shuffle the current queue');

export const execute = async (interaction) => {
	await interaction.deferReply({ ephemeral: true });

	const { guild, member, user } = interaction;
	const queue = useQueue(guild.id);

	// Check if the queue exists
	if (await queueDoesNotExist(interaction, queue)) return;

	// Check if the user is in the same voice channel as the bot
	if (await notInSameVoiceChannel(interaction, queue)) return;

	// Check if the queue is empty
	if (await queueIsEmpty(interaction, queue)) return;

	// Shuffle the queue
	queue.tracks.shuffle();

	logger.debug(`User <${user.username}> shuffled the queue in guild ${guild.name} (${guild.id}).`);

	const embed = new EmbedBuilder()
		.setAuthor({
			name: member.nickname || user.username,
			iconURL: user.avatarURL(),
		})
		.setColor(embedOptions.colors.success)
		.setDescription(
			`**${embedOptions.icons.shuffled} Shuffled queue tracks**\nThe **${queue.tracks.data.length}** tracks in the queue has been shuffled.\n\nView the new queue order with **\`/music queue\`**.`,
		);

	return interaction.editReply({ embeds: [embed] });
};
