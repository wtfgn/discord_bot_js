import { REST, Routes, Collection } from 'discord.js';
import fg from 'fast-glob';
import { useAppStore } from '@/store/app.js';

const updateSlashCommands = async (guildID, commandData) => {
	const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
	await rest.put(
		Routes.applicationGuildCommands(
			process.env.APP_ID,
			guildID,
		),
		{ body: commandData },
	);
};

export const loadCommands = async () => {
	const appStore = useAppStore();
	const commandData = [];
	const commands = new Collection();
	const files = await fg('./src/commands/**/index.js');
	for (const file of files) {
		const command = await import(file);
		// Push command data to array
		commandData.push(command.data);
		// Add command to collection
		commands.set(command.data.name, command.execute);
	}
	// Set commands collection to app store
	appStore.commandsActionMap = commands;
	// Update slash commands
	updateSlashCommands(process.env.GUILD_ID, commandData);
};

export const loadEvents = async () => {
	const appStore = useAppStore();
	const client = appStore.client;
	const files = await fg('./src/events/**/index.js');
	for (const file of files) {
		const event = await import(file);
		if (event.data.once) {
			client.once(event.data.name, (...args) => event.execute(...args));
		}
		else {
			client.on(event.data.name, (...args) => event.execute(...args));
		}
	}
};
