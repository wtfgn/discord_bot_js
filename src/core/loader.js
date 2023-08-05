import { REST, Routes, Collection } from 'discord.js';
import fg from 'fast-glob';
import { useAppStore } from '@/store/app.js';

const updateSlashCommands = async (guildID, commandData) => {
	const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
	try {
		const result = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, guildID),
			{ body: commandData },
		);
		console.log(`Successfully registered ${result.length} application commands.`);
	}
	catch (error) {
		console.error(error);
	}
};

export const loadCommands = async () => {
	const appStore = useAppStore();
	const commandData = [];
	const commands = new Collection();
	const files = await fg('./src/commands/**/index.js');
	for (const file of files) {
		// Import command
		const command = await import(file);
		// Check if command has data and execute properties
		if ('data' in command && 'execute' in command) {
			// Push command data to array
			commandData.push(command.data.toJSON());
			// Add command to collection
			commands.set(command.data.name, command);
		}
		else {
			console.error(`Command ${file} is missing data or execute property`);
		}
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
		// Check if event has data and execute properties
		if ('data' in event && 'execute' in event) {
			// Set event listener
			if (event.data.once) { client.once(event.data.name, event.execute); }
			else { client.on(event.data.name, event.execute); }
		}
		else {
			console.error(`Event ${file} is missing data or execute property`);
		}
	}
};
