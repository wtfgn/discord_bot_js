import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { useMainPlayer, useQueue } from 'discord-player';
import { notInSameVoiceChannel } from '@/utils/validator/voice_channel_validator.js';
import { cannotJoinVoiceOrTalk } from '@/utils/validator/permission_validator.js';
import { embedOptions, playerOptions } from '#/config/config.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('play')
	.setDescription('Add a track or playlist to the queue by searching or url.')
	.addStringOption(option =>
		option
			.setName('query')
			.setDescription('Provide the name or url for the song')
			.setMinLength(1)
			.setMaxLength(500)
			.setRequired(true));

export const execute = async (interaction) => {
	await interaction.deferReply({ ephemeral: true });

	const { options, user, guild, member, client } = interaction;
	const query = options.getString('query');
	const voiceChannel = member.voice.channel;
	const discordPlayer = useMainPlayer();
	let queue = useQueue(guild.id);
	let searchResult = null;

	// Check if the bot has permission to join and speak in the voice channel
	if (await cannotJoinVoiceOrTalk(interaction)) return;

	// Check if the user is in the same voice channel as the bot
	if (queue && (await notInSameVoiceChannel(interaction, queue))) return;

	try {
		searchResult = await discordPlayer.search(query, {
			requestedBy: user,
		});
	}
	catch (error) {
		console.error(error);
		await interaction.followUp({ content: `There was an error while executing this command!\n\`\`\`${error}\`\`\``, ephemeral: true });
	}

	if (!searchResult || !searchResult.tracks.length) {
		const embed = new EmbedBuilder();
		embed
			.setColor(embedOptions.colors.warning)
			.setDescription(`**${embedOptions.icons.warning} No track found**\nNo results found for \`${query}\`.\n\nIf you specified a URL, please make sure it is valid and public.`);
		return interaction.editReply({ embeds: [embed] });
	}

	// This is a temporary fix for live streams
	// if (
	// 	searchResult.tracks[0].raw.live &&
	// 	searchResult.tracks[0].raw.duration === 0 &&
	// 	searchResult.tracks[0].raw.source === 'youtube'
	// ) {
	// 	const embed = new EmbedBuilder();
	// 	embed.setColor('Red').setDescription('Cannot play live streams!');
	// 	return interaction.editReply({ embeds: [embed] });
	// }

	queue = useQueue(guild.id);
	const queueSize = queue?.size ?? 0;

	// Check if the queue is full
	if ((searchResult.playlist && searchResult.tracks.length) > playerOptions.maxQueueSize - queueSize) {
		const embed = new EmbedBuilder();
		embed
			.setColor(embedOptions.colors.warning)
			.setDescription(`**${embedOptions.icons.warning} Playlist too large**\nThis playlist is too large to be added to the queue.\n\nThe maximum amount of tracks that can be added to the queue is **${playerOptions.maxQueueSize}**.`);
		return interaction.editReply({ embeds: [embed] });
	}

	let track = null;

	// Try to play the track
	try {
		({ track } = await discordPlayer.play(voiceChannel, searchResult, {
			requestedBy: user,
			nodeOptions: {
				leaveOnEmpty: playerOptions.leaveOnEmpty ?? true,
				leaveOnEmptyCooldown: playerOptions.leaveOnEmptyCooldown ?? 300_000,
				leaveOnEnd: playerOptions.leaveOnEnd ?? true,
				leaveOnEndCooldown: playerOptions.leaveOnEndCooldown ?? 300_000,
				leaveOnStop: playerOptions.leaveOnStop ?? true,
				leaveOnStopCooldown: playerOptions.leaveOnStopCooldown ?? 300_000,
				maxSize: playerOptions.maxQueueSize ?? 1000,
				maxHistorySize: playerOptions.maxHistorySize ?? 100,
				volume: playerOptions.defaultVolume ?? 50,
				bufferingTimeout: playerOptions.bufferingTimeout ?? 3000,
				connectionTimeout: playerOptions.connectionTimeout ?? 30000,
				metadata: {
					interaction: interaction,
					channel: interaction.channel,
					client: interaction.client,
					requestedBy: user,
					track: searchResult.tracks[0],
				},
			},
		}));
	}
	catch (error) {
		if (error.message.includes('Sign in to confirm your age')) {
			const embed = new EmbedBuilder();
			embed
				.setColor(embedOptions.colors.warning)
				.setDescription(`**${embedOptions.icons.warning} Cannot retrieve audio for track**\nThis audio source is age restricted and requires login to access. Because of this I cannot retrieve the audio for the track.`);
			return interaction.editReply({ embeds: [embed] });
		}

		if (error.message.includes('The following content may contain')) {
			const embed = new EmbedBuilder();
			embed
				.setColor(embedOptions.colors.warning)
				.setDescription(`**${embedOptions.icons.warning} Cannot retrieve audio for track**\nThis audio source cannot be played as the video source has a warning for graphic or sensistive topics. It requires a manual confirmation to to play the video, and because of this I am unable to extract the audio for this source.`);
			return interaction.editReply({ embeds: [embed] });
		}

		if (
			(error.type === 'TypeError' &&
				(error.message.includes('Cannot read properties of null (reading \'createStream\')') ||
					error.message.includes('Failed to fetch resources for ytdl streaming'))) ||
			error.message.includes('Could not extract stream for this track')
		) {
			const embed = new EmbedBuilder();
			embed
				.setColor(embedOptions.colors.error)
				.setDescription(`**${embedOptions.icons.error} Uh-oh... Failed to add track!**\nAfter finding a result, I was unable to retrieve audio for the track.\n\nYou can try to perform the command again.`);
			return interaction.editReply({ embeds: [embed] });
		}

		if (error.message === 'Cancelled') {
			const embed = new EmbedBuilder();
			embed
				.setColor(embedOptions.colors.error)
				.setDescription(`**${embedOptions.icons.error} Uh-oh... Failed to add track!**\nSomething unexpected happened and the operation was cancelled.\n\nYou can try to perform the command again.`);
			return interaction.editReply({ embeds: [embed] });
		}

		// If the error is not handled above, log it to the console
		console.error(error);
		// Then send a generic error message to the user
		await interaction.followUp({ content: `There was an error while executing this command!\n\`\`\`${error}\`\`\``, ephemeral: true });
	}

	queue = useQueue(guild.id);

	// Check if the track was added to the queue
	if (!queue) {
		const embed = new EmbedBuilder();
		embed
			.setColor(embedOptions.colors.error)
			.setDescription(`**${embedOptions.icons.error} Uh-oh... Failed to add track!**\nThere was an issue adding this track to the queue.\n\nYou can try to perform the command again.`);
		return interaction.editReply({ embeds: [embed] });
	}

	if (track.source === 'arbitrary' || !track.thumbnail) {
		track.thumbnail = client.user.displayAvatarURL();
	}

	const durationFormat = track.raw.duration === 0 || track.duration === '0:00' ? '' : `\`${track.duration}\``;

	// Check if the track is a playlist and has more than one track
	if (searchResult.playlist && searchResult.tracks.length > 1) {
		const embed = new EmbedBuilder();
		embed
			.setThumbnail(track.thumbnail)
			.setAuthor({
				name: interaction.member.nickname || interaction.user.username,
				iconURL: interaction.user.avatarURL(),
			})
			.setColor(embedOptions.colors.success)
			.setDescription(
				`Added playlist to queue\n**${durationFormat} [${track.title
				}](${track.url})**\n\nAnd **${searchResult.tracks.length - 1
				}** more tracks... \`/music queue\` to view all.`);

		return interaction.editReply({ embeds: [embed] });
	}

	// Check if the track is the first track in the queue and the queue is empty
	if (queue.currentTrack === track && queue.tracks.data.length === 0) {
		const embed = new EmbedBuilder()
			.setThumbnail(track.thumbnail)
			.setAuthor({
				name: interaction.member.nickname || interaction.member.nickname || interaction.user.username,
				iconURL: interaction.user.avatarURL(),
			})
			.setColor(embedOptions.colors.success)
			.setDescription(`**${embedOptions.icons.audioStartedPlaying} Started playing**\n**${durationFormat} [${track.title}](${track.url})**`);

		return interaction.editReply({ embeds: [embed] });
	}

	const embed = new EmbedBuilder()
		.setThumbnail(track.thumbnail)
		.setAuthor({
			name: interaction.member.nickname || interaction.user.username,
			iconURL: interaction.user.avatarURL(),
		})
		.setColor(embedOptions.colors.success)
		.setDescription(`${embedOptions.icons.success} **Added to queue**\n**${durationFormat} [${track.title}](${track.url})**`);

	return interaction.editReply({ embeds: [embed] });
};