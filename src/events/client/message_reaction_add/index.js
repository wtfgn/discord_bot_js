import { Events } from 'discord.js';
import { Emojis } from '@/schemas/emojis.js';
import { logger } from '@/services/logger.js';

export const data = {
	name: Events.MessageReactionAdd,
};

export const execute = async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		}
		catch (error) {
			logger.error(error);
			console.error('Something went wrong when fetching the message: ', error);
			return;
		}
	}

	// Get message
	const { message } = reaction;
	const { guild } = message;
	// Check if the message is sent in a guild
	// or if the sender is a bot
	if (!message.guild || user.bot) return;


	// Add the emoji reaction to the message
	const guildDB = await Emojis.findOne({
		where: {
			guildId: guild.id,
		},
	});

	// Check if the emoji is set
	if (!guildDB) return;

	// Check if the emoji is set
	if (!guildDB.reactionEmojiId) return;

	// React to the message
	const emoji = guild.emojis.cache.get(guildDB.reactionEmojiId);
	if (!emoji) return;
	await message.react(emoji);
};
