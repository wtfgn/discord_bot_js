import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { logger } from '@/services/logger.js';

export const createClient = async () => {
	try {
		logger.info('Creating Discord client...');

		// Create a new client instance
		const client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildModeration,
				GatewayIntentBits.GuildPresences,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.DirectMessages,
			],
			partials: [
				Partials.Message,
				Partials.GuildMember,
				Partials.User,
				Partials.Channel,
				Partials.Reaction,
			],
		});

		logger.info('Successfully created Discord client');
		return client;
	} catch (err) {
		logger.error(err, 'Failed to create Discord client');
		throw err;
	}
};
