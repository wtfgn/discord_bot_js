import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { notInSameVoiceChannel } from '@/utils/validator/voice_channel_validator.js';
import { embedOptions } from '#/config/config.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('leave')
	.setDescription('Clear the queue and leave the voice channel');

export const execute = async (interaction) => {
	// Defer the reply to the interaction
	await interaction.deferReply({ ephemeral: true });

	const { guild, member, user } = interaction;
	const queue = useQueue(guild.id);

	// Check if the queue exists
	if (!queue) {
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
		queue.delete();
	}

	const embed = new EmbedBuilder()
		.setAuthor({
			name: member.nickname || user.username,
			iconURL: user.displayAvatarURL(),
		})
		.setColor(embedOptions.colors.success)
		.setDescription(
			`**${embedOptions.icons.success} Left voice channel**\nCleared the track queue and left the voice channel.\n\nTo play more music, use the **\`/music play\`** command.`,
		);

	return interaction.editReply({ embeds: [embed] });
};