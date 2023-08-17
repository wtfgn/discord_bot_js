import { SlashCommandSubcommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { notInSameVoiceChannel } from '@/utils/validator/voice_channel_validator.js';
import { queueDoesNotExist, queueNoCurrentTrack } from '@/utils/validator/queue_validator.js';
import { embedOptions } from '#/config/config.json';
import { createNowPlayingEmbed } from '@/utils/creator/embeds/music_embeds.js';


export const data = new SlashCommandSubcommandBuilder()
	.setName('now_playing')
	.setDescription('Show information about the track currently playing.');

export const execute = async (interaction) => {
	// Defer the reply to the interaction
	await interaction.deferReply({ ephemeral: true });

	const { guild, member, user } = interaction;
	const queue = useQueue(guild.id);

	// Check if the queue exists
	if (await queueDoesNotExist(interaction, queue)) return;

	// Check if the user is in the same voice channel as the bot
	if (await notInSameVoiceChannel(interaction, queue)) return;

	// Check if the queue has a current track
	if (await queueNoCurrentTrack(interaction, queue)) return;

	const loopModesFormatted = new Map([
		[0, 'disabled'],
		[1, 'track'],
		[2, 'queue'],
		[3, 'autoplay'],
	]);

	const currentTrack = queue.currentTrack;


	const nowPlayingActionRow = createNowPlayingActionRow('Skip track');
	const nowPlayingEmbed = createNowPlayingEmbed(queue, currentTrack, interaction);

	const response = await interaction.editReply({ embeds: [nowPlayingEmbed], components: [nowPlayingActionRow] });

	const collectorFilter = (i) => i.user.id === interaction.user.id;

	try {
		const confirmation = await response.awaitMessageComponent({
			filter: collectorFilter,
			time: 300_000,
		});

		await confirmation.deferUpdate();

		if (confirmation.customId === 'nowplaying-skip') {
			if (!queue || (queue.tracks.data.length === 0 && !queue.currentTrack)) {
				const errorEmbed = new EmbedBuilder()
					.setColor(embedOptions.colors.warning)
					.setDescription(
						`**${embedOptions.icons.warning} Oops!**\nThere is nothing currently playing. First add some tracks with **\`/music play\`**!`,
					);
				return interaction.followUp({ embeds: [errorEmbed], components: [] });
			}

			if (queue.currentTrack !== currentTrack) {
				const errorEmbed = new EmbedBuilder()
					.setColor(embedOptions.colors.warning)
					.setDescription(
						`**${embedOptions.icons.warning} Oops!**\nThis track has already been skipped or is no longer playing.`,
					);
				return interaction.followUp({ embeds: [errorEmbed], components: [] });
			}

			// Modify the now playing action row to be disabled
			const modifiedNowPlayingActionRow = createNowPlayingActionRow('Skip track', true);
			// Edit the reply to the interaction
			await interaction.editReply({ embeds: [nowPlayingEmbed], components: [modifiedNowPlayingActionRow] });

			// Skip the current track
			const skippedTrack = queue.currentTrack;
			const durationFormat =
				skippedTrack.raw.duration === 0 || skippedTrack.duration === '0:00'
					? ''
					: `\`${skippedTrack.duration}\``;

			queue.node.skip();

			const repeatModeUserString = loopModesFormatted.get(queue.repeatMode);

			const skippedTrackEmbed = new EmbedBuilder()
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
						} Looping**\nLoop mode is set to ${repeatModeUserString}. You can change it with **\`/music loop\`**.`
					}`,
				);

			return interaction.followUp({ embeds: [skippedTrackEmbed], components: [] });
		}
	}
	catch (error) {
		if (error.code === 'InteractionCollectorError') {
			const errorEmbed = new EmbedBuilder()
				.setColor(embedOptions.colors.error)
				.setDescription(
					`**${embedOptions.icons.error} Uh-oh...**\nYou did not interact with the buttons in time.`,
				);
			return interaction.followUp({ embeds: [errorEmbed], components: [] });
		}
		else {
			console.log(error);
		}
	}
};

const createNowPlayingActionRow = (label, disabled = false) => {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('nowplaying-skip')
			.setLabel(label)
			.setStyle('Secondary')
			.setEmoji(embedOptions.icons.nextTrack)
			.setDisabled(disabled),
	);
};