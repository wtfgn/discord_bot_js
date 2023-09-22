import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { Emojis } from '@/schemas/emojis';
import { embedOptions } from '#/config/config.json';
import { logger } from '@/services/logger.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('set_reaction_emoji')
	.setDescription(
		'Set the emoji that will be reacted to the message when a user reacts to a message',
	)
	.addStringOption((option) =>
		option
			.setName('emoji')
			.setDescription('The emoji')
			.setRequired(true),
	);

export const execute = async (interaction) => {
	const { options, guild } = interaction;
	const emojiString = options.getString('emoji');
	let emojiID = emojiString;

	// Get emoji ID
	if (emojiString.startsWith('<')) {
		emojiID = emojiString.split(':')[2].replace('>', '');
	}

	logger.debug(
		`User <${interaction.user.username}> is trying to set reaction emoji to <${emojiID}>`,
	);

	// Check if the emoji exists in the guild
	const emoji = guild.emojis.cache.get(emojiID);
	if (!emoji) {
		logger.debug(
			`User <${interaction.user.username}> tried to set reaction emoji but it was not found`,
		);

		const embed = new EmbedBuilder();
		embed
			.setColor(embedOptions.colors.error)
			.setDescription(
				`**${embedOptions.icons.warning} The emoji was not found**,\nplease make sure that the emoji exists in this guild`,
			);

		return await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	}

	// Get guild from DB, if not found, create one
	const [guildDB] = await Emojis.findOrCreate({
		where: {
			guildId: guild.id,
		},
	});

	// Check if emoji is already set
	if (guildDB.reactionEmojiId === emojiID) {
		logger.debug(
			`User <${interaction.user.username}> tried to set seen emoji but it was already set`,
		);

		const embed = new EmbedBuilder();
		embed
			.setColor(embedOptions.colors.error)
			.setDescription(
				`**${embedOptions.icons.warning} The emoji is already set**,\nplease try another emoji`,
			);

		return await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	}

	// Update guild
	await Emojis.update({
		reactionEmojiId: emojiID,
	}, {
		where: {
			guildId: guild.id,
		},
	});

	logger.debug(
		`User <${interaction.user.username}> set reaction emoji to <${emojiID}>`,
	);

	const embed = new EmbedBuilder();
	embed
		.setColor(embedOptions.colors.success)
		.setDescription(
			`**${embedOptions.icons.success} Reaction emoji set to <${emoji}>**`,
		);

	return await interaction.reply({
		embeds: [embed],
		ephemeral: true,
	});
};
