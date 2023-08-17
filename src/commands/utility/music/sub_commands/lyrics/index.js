import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { useMainPlayer, useQueue, QueryType } from 'discord-player';
import { notInSameVoiceChannel } from '@/utils/validator/voice_channel_validator.js';
import { queueDoesNotExist, queueNoCurrentTrack } from '@/utils/validator/queue_validator.js';
import { embedOptions } from '#/config/config.json';
import { lyricsExtractor } from '@discord-player/extractor';
import { inlineCode } from 'discord.js';
import { logger } from '@/services/logger.js';


export const data = new SlashCommandSubcommandBuilder()
	.setName('lyrics')
	.setDescription('Get the lyrics of the current track')
	.addStringOption(option =>
		option
			.setName('query')
			.setDescription('The query or URL to search for')
			.setMinLength(2)
			.setMaxLength(500)
			.setAutocomplete(true)
			.setRequired(false));

export const execute = async (interaction) => {

	const { guild, options } = interaction;
	const query = options.getString('query');
	const queue = useQueue(guild.id);
	let geniusSearchQuery = '';

	if (!query) {
		if (await queueDoesNotExist(interaction, queue)) return;

		if (await notInSameVoiceChannel(interaction, queue)) return;

		if (await queueNoCurrentTrack(interaction, queue)) return;

		geniusSearchQuery = queue.currentTrack.title.slice(0, 50);
	}

	let searchResult = null;
	if (query) {
		const player = useMainPlayer();
		const searchResults = await player.search(query, {
			searchEngine: QueryType.YOUTUBE_SEARCH,
			fallbackSearchEngine: QueryType.SPOTIFY_SEARCH,
		});

		if (searchResults.tracks.length === 0) {
			logger.debug(`User <${interaction.user.username}> tried to use <${interaction.commandName}> command with no search results`);

			const embed = new EmbedBuilder()
				.setColor(embedOptions.colors.warning)
				.setDescription(
					`**${embedOptions.icons.warning} No search results found**\nThere was no search results found for query **${query}**.`,
				);

			return interaction.reply({ embeds: [embed] });
		}

		searchResult = searchResults.tracks[0];
		geniusSearchQuery = searchResults.tracks[0].title;
		console.log(`Using query for genius ${geniusSearchQuery}`);
	}

	// Get the lyrics
	const genius = lyricsExtractor();
	let lyricsResult = await genius.search(geniusSearchQuery).catch(() => null);

	// Try again with shorter query (some titles just have added info in the end)
	if (!lyricsResult && geniusSearchQuery.length > 20) {
		lyricsResult = await genius.search(geniusSearchQuery.slice(0, 20)).catch(() => null);
	}
	if (!lyricsResult && geniusSearchQuery.length > 10) {
		lyricsResult = await genius.search(geniusSearchQuery.slice(0, 10)).catch(() => null);
	}

	let nonMatchMessage = '';
	// Check if authors in track from searchResult includes the artist name from genius
	if (searchResult && lyricsResult) {
		const searchResultAuthorIncludesArtist =
			searchResult.author
				.toLowerCase()
				.includes(lyricsResult.artist.name.toLowerCase());

		const lyricsResultArtistIncludesAuthor =
			lyricsResult.artist.name
				.toLowerCase()
				.includes(searchResult.author.toLowerCase());

		const searchResultAuthorSplitIncludesArtist =
			lyricsResult.artist.name
				.toLowerCase()
				.includes(searchResult.author.split(', ')[0].toLowerCase());

		if (
			!searchResultAuthorIncludesArtist &&
			!lyricsResultArtistIncludesAuthor &&
			!searchResultAuthorSplitIncludesArtist
		) {
			logger.debug(`User <${interaction.user.username}> tried to use <${interaction.commandName}> command with no matching artist`);

			nonMatchMessage =
				'Found lyrics, but artist name did not match from player result.\n' +
				`**Player result:** ${searchResult.author}\n` +
				`**Genius result:** ${lyricsResult.artist.name}`;
		}
	}

	if (!lyricsResult || !lyricsResult.lyrics) {
		logger.debug(`User <${interaction.user.username}> tried to use <${interaction.commandName}> command with no lyrics found`);

		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.warning)
			.setDescription(
				`**${embedOptions.icons.warning} No lyrics found**\nThere was no lyrics found for **${geniusSearchQuery}**.`,
			);

		return interaction.reply({ embeds: [embed] });
	}

	// If message length is too long, split into multiple messages
	if (lyricsResult.lyrics.length > 3800) {
		logger.debug(`User <${interaction.user.username}> tried to use <${interaction.commandName}> command with too long lyrics`);
		const messageCount = Math.ceil(lyricsResult.lyrics.length / 3800);

		for (let i = 0; i < messageCount; i++) {
			logger.debug(`User <${interaction.user.username}> tried to use <${interaction.commandName}> command with too long lyrics, sending message ${i + 1}/${messageCount}`);
			const message = lyricsResult.lyrics.slice(i * 3800, (i + 1) * 3800);

			if (i === 0) {
				const embed = new EmbedBuilder()
					.setColor(embedOptions.colors.info)
					.setDescription(
						`**${embedOptions.icons.queue} Showing lyrics**\n` +
						`**Track: [${lyricsResult.title}](${lyricsResult.url})**\n` +
						`**Artist: [${lyricsResult.artist.name}](${lyricsResult.artist.url})**` +
						`${nonMatchMessage ? `\n\n${inlineCode(nonMatchMessage)}` : ''}` +
						`\n\n\`\`\`fix\n${message}\`\`\``,
					);

				await interaction.reply({ embeds: [embed] });
				continue;
			}
			else {
				const embed = new EmbedBuilder()
					.setColor(embedOptions.colors.info)
					.setDescription(`\`\`\`fix\n${message}\`\`\``);

				await interaction.followUp({ embeds: [embed] });
			}
		}

		return;
	}

	logger.debug(`User <${interaction.user.username}> used <${interaction.commandName}> command and got lyrics`);

	const embed = new EmbedBuilder()
		.setColor(embedOptions.colors.info)
		.setDescription(
			`**${embedOptions.icons.queue} Showing lyrics**\n` +
			`**Track: [${lyricsResult.title}](${lyricsResult.url})**\n` +
			`**Artist: [${lyricsResult.artist.name}](${lyricsResult.artist.url})**` +
			`${nonMatchMessage ? `\n\n${inlineCode(nonMatchMessage)}` : ''}` +
			`\n\n\`\`\`fix\n${lyricsResult.lyrics}\`\`\``,
		);

	await interaction.reply({ embeds: [embed] });
};

export const autocomplete = async (interaction) => {
	const { options } = interaction;
	const query = options.getString('query');

	// If the query is less than 2 characters, return
	if (query.length < 2) return;

	const genius = lyricsExtractor();
	const lyricsResult = await genius.search(query).catch(() => null);

	let response = [];

	if (!lyricsResult) {
		const player = useMainPlayer();
		const searchResults = await player.search(query);
		response = searchResults.tracks.slice(0, 1).map((track) => ({
			name:
				`${track.title} [Artist: ${track.author}]`.length > 100
					? `${track.title}`.slice(0, 100)
					: `${track.title} [Author: ${track.author}]`,
			value: track.title.slice(0, 100),
		}));
	}
	else {
		response = [
			{
				name: `${lyricsResult.title} [Artist: ${lyricsResult.artist.name}]`.slice(0, 100),
				value: lyricsResult.title.slice(0, 100),
			},
		];
	}

	if (!response || response.length === 0) {
		return interaction.respond([]);
	}

	logger.debug(`Autocomplete search responded for query: ${query}`);
	return interaction.respond(response);
};