import vueInit from '@/core/vue.js';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { loadCommands, loadEvents, loadPlayerEvents } from '@/utils/loader.js';
import { useAppStore } from '@/store/app.js';
import { createPlayer } from '@/core/discord_player/create_player.js';
import { createClient } from '@/core/client/create_client.js';
import { logger } from '@/services/logger.js';

// Initialize Vue.js
vueInit();

// Load .env file
dotenv.config();

// Initialize database
export const sequelize = new Sequelize('database', 'user', 'password', {
	dialect: 'sqlite',
	storage: 'database.sqlite',
	logging: false,
});

(async () => {
	try {
		// Create a new client instance
		const client = await createClient();
		// Create a new player instance
		const player = await createPlayer(client);
		// Create app store
		const appStore = useAppStore();

		// Add client to app store
		appStore.client = client;

		// Delete global commands
		// await deleteGlobalCommands();
		// await deleteGuildCommands('658513443166486528');

		// Load commands and evnets
		await loadCommands(client);
		await loadEvents(client);

		// Load player events
		await loadPlayerEvents(player);

		// Login to Discord with your client's token
		await client.login(process.env.BOT_TOKEN);
	} catch (err) {
		logger.error(err, 'Failed to initialize application');
		throw err;
	}
})();
