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
	// If the index.js is in a sub_commands folder, do not load it
	const files = await fg('./src/commands/**/index.js', { ignore: './src/commands/**/sub_commands/**/index.js' });
	for (const file of files) {
		// Import command
		const command = await import(file);
		// Check if command has data and execute properties
		if ('data' in command && 'execute' in command) {
			if (command.subCommands) {
				// Load sub commands
				const subCommands = await loadSubCommands(command.data.name);
				// Add sub commands to command data
				for (const subCommand of subCommands.values()) {
					// Add sub command data to command data
					command.data.addSubcommand(subCommand.data);
					// Add sub command to sub commands collection
					command.subCommands.set(subCommand.data.name, subCommand);
				}
			}
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
	const files = await fg('./src/events/client/**/index.js');
	for (const file of files) {
		const event = await import(file);
		// Check if event has data and execute properties
		if ('data' in event && 'execute' in event) {
			// Set event listener
			event.data.once ?
				client.once(event.data.name, (...args) => event.execute(...args))
				: client.on(event.data.name, (...args) => event.execute(...args));
		}
		else {
			console.error(`Event ${file} is missing data or execute property`);
		}
	}
};

export const loadSubCommands = async (commandName) => {
	const subCommands = new Collection();
	const files = await fg(`./src/commands/**/${commandName}/sub_commands/**/index.js`);
	for (const file of files) {
		// Import sub command
		const subCommand = await import(file);
		// Check if sub command has data and execute properties
		if ('data' in subCommand && 'execute' in subCommand) {
			// Add sub command to map
			subCommands.set(subCommand.data.name, subCommand);
		}
		else {
			console.error(`Sub command ${file} is missing data or execute property`);
		}
	}
	console.log(`Loaded ${subCommands.size} sub commands for ${commandName}`);
	return subCommands;
};

export const loadPlayerEvents = async (discordPlayer) => {
	const files = await fg('./src//events/discord_player/**/index.js');
	for (const file of files) {
		const event = await import(file);
		// Check if event is debug, if so, skip
		if (event.isDebug) { continue; }
		// Check if event has data and execute properties
		if ('data' in event && 'execute' in event) {
			// Set event listener
			event.data.once ?
				discordPlayer.once(event.data.name, (...args) => event.execute(...args))
				: (event.isPlayerEvent ?
					discordPlayer.events.on(event.data.name, (...args) => event.execute(...args))
					: discordPlayer.on(event.data.name, (...args) => event.execute(...args)));
		}
		else {
			console.error(`Event ${file} is missing data or execute property`);
		}
	}
};

export const deleteGuildCommands = async () => {
	const rest = new REST().setToken(process.env.BOT_TOKEN);
	try {
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: [] },
		);
		console.log('Successfully deleted guild commands.');
	}
	catch (error) {
		console.error(error);
	}
};

export const deleteGlobalCommands = async () => {
	const rest = new REST().setToken(process.env.BOT_TOKEN);
	try {
		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: [] },
		);
		console.log('Successfully deleted global commands.');
	}
	catch (error) {
		console.error(error);
	}
};