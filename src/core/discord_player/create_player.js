import { Player } from 'discord-player';
import { logger } from '@/services/logger.js';

export const createPlayer = async (client) => {
	try {
		// Initialize Discord player
		const discordPlayer = Player.singleton(client, {
			ytdlOptions: {
				quality: 'highestaudio',
				highWaterMark: 1 << 25,
				requestedOptions: {
					headers: {
						cookie: process.env.YT_COOKIE || '',
					},
				},
			},
		});

		// Load extractors
		await discordPlayer.extractors.loadDefault();

		logger.info('Successfully created Discord player');
		return discordPlayer;
	} catch (err) {
		logger.error('Failed to create Discord player', err);
	}
};
