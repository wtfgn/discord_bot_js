import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { notInSameVoiceChannel } from '@/utils/validator/voice_channel_validator.js';
import { embedOptions } from '#/config/config.json';
import { logger } from '@/services/logger.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('stop')
	.setDescription('Stop the current track and clear the queue');

export const execute = async (interaction) => {
	// Defer the reply to the interaction
	await interaction.deferReply({ ephemeral: true });

	const { guild, member, user } = interaction;
	const queue = useQueue(guild.id);

	// Check if the queue exists
	if (!queue) {
		logger.debug(`User <${interaction.user.username}> tried to use <${interaction.commandName}> command without a queue`);

		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.warning)
			.setDescription(
				`**${embedOptions.icons.warning} Oops!**\n_Hmm.._ It seems I am not in a voice channel!`,
			);
		return interaction.editReply({ embeds: [embed] });
	}

	// Check if the user is in the same voice channel as the bot
	if (await notInSameVoiceChannel(interaction, queue)) return;

	if (!queue.deleted) {
		queue.setRepeatMode(0);
		queue.clear();
		queue.node.stop();

		logger.debug(`User <${interaction.user.username}> stopped the queue`);
	}

	const embed = new EmbedBuilder()
		.setAuthor({
			name: member.nickname || user.username,
			iconURL: user.displayAvatarURL(),
		})
		.setColor(embedOptions.colors.success)
		.setDescription(
			`**${embedOptions.icons.success} Stopped playing**\nStopped playing audio and cleared the track queue.\n\nTo play more music, use the **\`/music play\`** command.`,
		);

	return interaction.editReply({ embeds: [embed] });
};