import vueInit from '@/core/vue.js';
// Require the necessary discord.js classes
import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { loadCommands, loadEvents } from '@/core/loader.js';
import { useAppStore } from '@/store/app.js';

// Initialize Vue.js
vueInit();

// Load .env file
dotenv.config();

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.DirectMessages,
	],
});

// Initialize app store
const appStore = useAppStore();
// Set client to app store
appStore.client = client;

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);

// Load commands
loadCommands();
// Load events
loadEvents();
