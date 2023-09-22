import { Events } from 'discord.js';

export const data = {
	name: Events.MessageReactionAdd,
};

export const execute = async (reaction) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			return;
		}
	}

	// Get message
	// Check if reaction is added to a message in a guild channel
	if (!reaction.message.guild) return;

	// Add confirmation emoji if there is no confirmation emoji
	if (
		!reaction.message.reactions.cache.has(process.env.CONFIRMATION_EMOJI_ID)
	) {
		try {
			await reaction.message.react(process.env.CONFIRMATION_EMOJI_ID);
		} catch (error) {
			console.error(
				'Something went wrong when adding the confirmation emoji: ',
				error,
			);
			return;
		}
	}
};
