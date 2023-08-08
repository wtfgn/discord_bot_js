import vueInit from '@/core/vue.js';
// Require the necessary discord.js classes
import { Client, GatewayIntentBits } from 'discord.js';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { loadCommands, loadEvents } from '@/core/loader.js';
import { useAppStore } from '@/store/app.js';

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
