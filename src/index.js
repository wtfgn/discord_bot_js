import vueInit from '@/core/vue.js';
// Require the necessary discord.js classes
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { loadCommands, loadEvents, loadPlayerEvents, deleteGuildCommands, deleteGlobalCommands } from '@/utils/loader.js';
import { useAppStore } from '@/store/app.js';
import { createPlayer } from '@/core/discord_player/create_player.js';

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
createPlayer(client).then(player => {
	// Add event listeners to discord player
	loadPlayerEvents(player);
});
// Initialize app store
const appStore = useAppStore();

appStore.client = client;

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);

(async () => {
	// Delete all commands
	await deleteGuildCommands();
	await deleteGlobalCommands();

	// Load commands and events
	await loadCommands();
	await loadEvents();
})();
