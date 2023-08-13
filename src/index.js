import vueInit from '@/core/vue.js';
// Require the necessary discord.js classes
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { loadCommands, loadEvents } from '@/core/loader.js';
import { useAppStore } from '@/store/app.js';
import { DisTube } from 'distube';
import { SpotifyPlugin } from '@distube/spotify';
import { YtDlpPlugin } from '@distube/yt-dlp';

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

// Initialize app store
const appStore = useAppStore();

// Initialize Distube
const distube = new DisTube(client, {
	emitNewSongOnly: true,
	leaveOnFinish: true,
	emitAddSongWhenCreatingQueue: false,
	emitAddListWhenCreatingQueue: false,
	plugins: [
		new SpotifyPlugin(),
		new YtDlpPlugin({ update: false }),
	],
});

const status = queue =>
	`Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.names.join(', ') || 'Off'}\` | Loop: \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off'
	}\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``;

distube
	.on('playSong', (queue, song) =>
		queue.textChannel.send(
			`${client.emotes.play} | Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user
			}\n${status(queue)}`,
		),
	)
	.on('addSong', (queue, song) =>
		queue.textChannel.send(
			`${client.emotes.success} | Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`,
		),
	)
	.on('addList', (queue, playlist) =>
		queue.textChannel.send(
			`${client.emotes.success} | Added \`${playlist.name}\` playlist (${playlist.songs.length
			} songs) to queue\n${status(queue)}`,
		),
	)
	.on('error', (channel, e) => {
		if (channel) channel.send(`${client.emotes.error} | An error encountered: ${e.toString().slice(0, 1974)}`);
		else console.error(e);
	})
	.on('empty', channel => channel.send('Voice channel is empty! Leaving the channel...'))
	.on('searchNoResult', (message, query) =>
		message.channel.send(`${client.emotes.error} | No result found for \`${query}\`!`),
	)
	.on('finish', queue => queue.textChannel.send('Finished!'));

appStore.client = client;
appStore.distube = distube;

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);

loadCommands();
loadEvents();
