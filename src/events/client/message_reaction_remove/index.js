import { Events } from 'discord.js';
import { Emojis } from '@/schemas/emojis.js';
import { logger } from '@/services/logger.js';

export const data = {
	name: Events.MessageReactionRemove,
};

export const execute = async (reaction) => {
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

	// Check if reaction is added to a message in a guild channel
	if (!reaction.message.guild) return;

	// Remove confirmation emoji if it is the only emoji
	if (reaction.message.reactions.cache.size === 1) {
		try {
			const guildDB = await Emojis.findOne({
				where: {
					guildId: reaction.message.guild.id,
				},
			});

			if (!guildDB) return;

			if (!guildDB.reactionEmojiId) return;

			await reaction.message.reactions.cache
				.get(guildDB.reactionEmojiId)
				.remove();
		}
		catch (error) {
			logger.error(error);
			console.error(
				'Something went wrong when removing the confirmation emoji: ',
				error,
			);
			return;
		}
	}
};
