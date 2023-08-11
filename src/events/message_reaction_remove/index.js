import { Events } from 'discord.js';
import config from '@/config.json';

export const data = {
	name: Events.MessageReactionRemove,
};

export const execute = async (reaction) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		}
		catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			return;
		}
	}

	// Check if reaction is added to a message in a guild channel
	if (!reaction.message.guild) return;

	// Remove confirmation emoji if it is the only emoji
	if (reaction.message.reactions.cache.size === 1) {
		try {
			await reaction.message.reactions.cache.get(config.confirmationEmojiID).remove();
		}
		catch (error) {
			console.error('Something went wrong when removing the confirmation emoji: ', error);
			return;
		}
	}
};