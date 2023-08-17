import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { notInSameVoiceChannel } from '@/utils/validator/voice_channel_validator.js';
import { queueDoesNotExist } from '@/utils/validator/queue_validator.js';
import { embedOptions } from '#/config/config.json';

export const data = new SlashCommandSubcommandBuilder()
	.setName('remove')
	.setDescription('Remove a track from the queue')
	.addIntegerOption(option =>
		option
			.setName('track_number')
			.setDescription('Provide the track number to remove')
			.setMinValue(1)
			.setRequired(true));

export const execute = async (interaction) => {
	// Defer the reply to the interaction
	await interaction.deferReply({ ephemeral: true });

	const { guild, member, user, options } = interaction;
	const queue = useQueue(guild.id);
	const removeTrackNumber = options.getInteger('track_number');

	// Check if the queue exists
	if (await queueDoesNotExist(interaction, queue)) return;

	// Check if the user is in the same voice channel as the bot
	if (await notInSameVoiceChannel(interaction, queue)) return;

	// Check if the track number is valid
	if (removeTrackNumber > queue.tracks.data.length) {
		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.warning)
			.setDescription(
				`**${embedOptions.icons.warning} Oops!**\nTrack \`${removeTrackNumber}\` is not a valid track number. There are a total of\`${queue.tracks.data.length}\` tracks in the queue.\n\nView tracks added to the queue with **\`/music queue\`**.`,
			);
		return interaction.editReply({ embeds: [embed] });
	}

	// Remove the track
	const removedTrack = queue.node.remove(removeTrackNumber - 1);
	const durationFormat = removedTrack.raw.duration === 0 || removedTrack.duration === '0:00' ? '' : `\`${removedTrack.duration}\``;

	const embed = new EmbedBuilder()
		.setAuthor({
			name: member.nickname || user.username,
			iconURL: user.displayAvatarURL(),
		})
		.setColor(embedOptions.colors.success)
		.setThumbnail(removedTrack.thumbnail)
		.setDescription(
			`**${embedOptions.icons.success} Removed track**\n**${durationFormat} [${removedTrack.title}](${removedTrack.url})**`,
		);

	return interaction.editReply({ embeds: [embed] });
};