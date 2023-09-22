import { Events, MessageType } from 'discord.js';
import { Emojis } from '@/schemas/emojis.js';
import { logger } from '@/services/logger.js';

export const data = {
	name: Events.MessageCreate,
};

export const execute = async (message) => {
	if (message.partial) {
		try {
			await message.fetch();
		}
		catch (error) {
			logger.error(error);
			console.error('Something went wrong when fetching the message: ', error);
			return;
		}
	}

	// Only allow default and reply messages
	if (message.type !== MessageType.Default && message.type !== MessageType.Reply) return;

	// Get guild
	const { guild } = message;
	// Check if reaction is added to a message in a guild channel
	if (!message.guild) return;


	// Add the emoji reaction to the message
	const guildDB = await Emojis.findOne({
		where: {
			guildId: guild.id,
		},
	});

	// Check if the emoji is set
	if (!guildDB) return;

	// Check if the emoji is set
	if (!guildDB.seenEmojiId) return;

	// React to the message
	const emoji = guild.emojis.cache.get(guildDB.seenEmojiId);
	if (!emoji) return;
	await message.react(emoji);
};
