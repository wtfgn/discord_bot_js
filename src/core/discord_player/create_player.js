import { Player } from 'discord-player';

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

		return discordPlayer;
	}
	catch (err) {
		console.error(err);
	}
};