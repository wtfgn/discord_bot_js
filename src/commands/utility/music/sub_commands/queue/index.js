import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { notInSameVoiceChannel } from '@/utils/validator/voice_channel_validator.js';
import { embedOptions, playerOptions } from '#/config/config.json';

export const data = new SlashCommandSubcommandBuilder()
	.setName('queue')
	.setDescription('Show the current queue')
	.addIntegerOption(option =>
		option
			.setName('page')
			.setDescription('Provide the page number')
			.setMinValue(1));

export const execute = async (interaction) => {
	// Defer the reply to the interaction
	await interaction.deferReply({ ephemeral: true });

	const { options, guild } = interaction;
	const pageIndex = (options.getInteger('page') || 1) - 1;
	const queue = useQueue(guild.id);
	let queueString = '';

	// Check if the user is in the same voice channel as the bot
	if (queue && (await notInSameVoiceChannel(interaction, queue))) return;

	if (!queue) {
		if (pageIndex >= 1) {
			const embed = new EmbedBuilder()
				.setColor(embedOptions.colors.warning)
				.setDescription(`**${embedOptions.icons.warning} Oops!**\nPage \`${pageIndex + 1}\` is not a valid page number.\n\nThe queue is currently empty, first add some tracks with **\`/play\`**!`);
			return interaction.editReply({ embeds: [embed] });
		}

		queueString = 'The queue is empty, add some tracks with **`/music play`**!';
		const embed = new EmbedBuilder()
			.setAuthor({
				name: guild.name,
				iconURL: guild.iconURL(),
			})
			.setColor(embedOptions.colors.info)
			.setDescription(`**${embedOptions.icons.queue} Tracks in queue**\n${queueString}`)
			.setFooter({
				text: 'Page 1 of 1 (0 tracks)',
			});
		return interaction.editReply({ embeds: [embed] });
	}

	const queueLength = queue.tracks.data.length;
	const totalPages = Math.ceil(queueLength / playerOptions.queuePerPage) || 1;

	if (pageIndex >= totalPages) {
		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.warning)
			.setDescription(`**${embedOptions.icons.warning} Oops!**\nPage \`${pageIndex + 1}\` is not a valid page number.\n\nThe queue currently has \`${queueLength}\` tracks, so the last page is \`${totalPages}\`.`);
		return interaction.editReply({ embeds: [embed] });
	}

	if (queue.tracks.data.length === 0) {
		queueString = 'The queue is empty, add some tracks with **`/music play`**!';
	}
	else {
		queueString = queue.tracks.data
			.slice(pageIndex * 10, pageIndex * 10 + 10)
			.map((track, index) => {
				const durationFormat =
					track.raw.duration === 0 || track.duration === '0:00' ? '' : `\`${track.duration}\``;

				return `**${pageIndex * 10 + index + 1}.** **${durationFormat} [${track.title}](${track.url})**`;
			})
			.join('\n');
	}

	const currentTrack = queue.currentTrack;

	const loopModesFormatted = new Map([
		[0, 'disabled'],
		[1, 'track'],
		[2, 'queue'],
		[3, 'autoplay'],
	]);

	const loopModeUserString = loopModesFormatted.get(queue.repeatMode);

	const repeatModeString = `${queue.repeatMode === 0
		? '' :
		`**${queue.repeatMode === 3 ? embedOptions.icons.autoplay : embedOptions.icons.loop
		} Looping**\nLoop mode is set to ${loopModeUserString}. You can change it with **\`/loop\`**.\n\n`}`;

	if (!currentTrack) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: `Channel: ${queue.channel.name} (${queue.channel.bitrate / 1000}kbps)`,
				iconURL: guild.iconURL(),
			})
			.setColor(embedOptions.colors.info)
			.setDescription(`${repeatModeString}` + `**${embedOptions.icons.queue} Tracks in queue**\n${queueString}`)
			.setFooter({
				text: `Page ${pageIndex + 1} of ${totalPages} (${queueLength} tracks)`,
			});
		return interaction.editReply({ embeds: [embed] });
	}
	else {
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
			bar = '_No duration available._';
		}

		const embed = new EmbedBuilder()
			.setAuthor({
				name: `Channel: ${queue.channel.name} (${queue.channel.bitrate / 1000}kbps)`,
				iconURL: interaction.guild.iconURL(),
			})
			.setThumbnail(queue.currentTrack.thumbnail)
			.setColor(embedOptions.colors.info)
			.setDescription(`**${embedOptions.icons.audioPlaying} Now playing**\n` +
			(currentTrack ? `**[${currentTrack.title}](${currentTrack.url})**` : 'None') +
			`\nRequested by: <@${currentTrack.requestedBy.id}>` +
			`\n ${bar}\n\n` +
			`${repeatModeString}` +
			`**${embedOptions.icons.queue} Tracks in queue**\n${queueString}`)
			.setFooter({
				text: `Page ${pageIndex + 1} of ${totalPages} (${queueLength} tracks)`,
			});
		return interaction.editReply({ embeds: [embed] });
	}
};