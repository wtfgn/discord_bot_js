import { EmbedBuilder } from 'discord.js';
import { embedOptions, playerOptions } from '#/config/config.json';

export const createNowPlayingEmbed = (queue, currentTrack, interaction) => {
	const sourceStringsFormatted = new Map([
		['youtube', 'YouTube'],
		['soundcloud', 'SoundCloud'],
		['spotify', 'Spotify'],
		['apple_music', 'Apple Music'],
		['arbitrary', 'Direct source'],
	]);

	const sourceIcons = new Map([
		['youtube', embedOptions.icons.sourceYouTube],
		['soundcloud', embedOptions.icons.sourceSoundCloud],
		['spotify', embedOptions.icons.sourceSpotify],
		['apple_music', embedOptions.icons.sourceAppleMusic],
		['arbitrary', embedOptions.icons.sourceArbitrary],
	]);

	let author = currentTrack.author ? currentTrack.author : 'Unavailable';
	if (author === 'cdn.discordapp.com') {
		author = 'Unavailable';
	}
	let plays = currentTrack.views !== 0 ? currentTrack.views : 0;

	if (
		plays === 0 &&
		currentTrack.metadata.bridge &&
		currentTrack.metadata.bridge.views !== 0 &&
		currentTrack.metadata.bridge.views !== undefined
	) {
		plays = currentTrack.metadata.bridge.views;
	}
	else if (plays === 0) {
		plays = 'Unavailable';
	}

	const source =
		sourceStringsFormatted.get(currentTrack.raw.source) ?? 'Unavailable';
	const queueLength = queue.tracks.data.length;
	const timestamp = queue.node.getTimestamp();
	let bar = `**\`${timestamp.current.label}\`** ${queue.node.createProgressBar({
		queue: false,
		length: playerOptions.progressBar.length ?? 12,
		timecodes: playerOptions.progressBar.timecodes ?? false,
		indicator: playerOptions.progressBar.indicator ?? '🔘',
		leftChar: playerOptions.progressBar.leftChar ?? '▬',
		rightChar: playerOptions.progressBar.rightChar ?? '▬',
	})} **\`${timestamp.total.label}\`**`;

	if (currentTrack.raw.duration === 0 || currentTrack.duration === '0:00') {
		bar = 'No duration available.';
	}

	const loopModesFormatted = new Map([
		[0, 'disabled'],
		[1, 'track'],
		[2, 'queue'],
		[3, 'autoplay'],
	]);

	const loopModeUserString = loopModesFormatted.get(queue.repeatMode);

	return new EmbedBuilder()
		.setAuthor({
			name: `Channel: ${queue.channel.name} (${
				queue.channel.bitrate / 1000
			}kbps)`,
			iconURL: interaction.guild.iconURL(),
		})
		.setColor(embedOptions.colors.info)
		.setThumbnail(currentTrack.thumbnail)
		.setDescription(
			(queue.node.isPaused()
				? '**Currently Paused**\n'
				: `**${embedOptions.icons.audioPlaying} Now Playing**\n`) +
				`**[${currentTrack.title}](${currentTrack.url})**` +
				`\nRequested by: <@${currentTrack.requestedBy.id}>` +
				`\n ${bar}\n\n` +
				`${
					queue.repeatMode === 0
						? ''
						: `**${
							queue.repeatMode === 3
								? embedOptions.icons.autoplay
								: embedOptions.icons.loop
						} Looping**\nLoop mode is set to ${loopModeUserString}. You can change it with **\`/music loop\`**.`
				}`,
		)
		.addFields({
			name: '**Author**',
			value: author,
			inline: true,
		})
		.addFields({
			name: '**Plays**',
			value: plays.toLocaleString('en-US'),
			inline: true,
		})
		.addFields({
			name: '**Track source**',
			value: `**${sourceIcons.get(currentTrack.raw.source)} [${source}](${
				currentTrack.url
			})**`,
			inline: true,
		})
		.setFooter({
			text: queueLength ? `${queueLength} other tracks in the queue...` : ' ',
		});
};
