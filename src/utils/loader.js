import { REST, Routes, Collection } from 'discord.js';
import fg from 'fast-glob';
import { useAppStore } from '@/store/app.js';
import { logger } from '@/services/logger.js';

const updateSlashCommands = async (guildID, commandData) => {
	const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
	try {
		if (guildID) {
			const result = await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENT_ID, guildID),
				{ body: commandData },
			);
			logger.info(`Successfully registered ${result.length} slash commands for guild ${guildID}`);
		}
		else {
			const result = await rest.put(
				Routes.applicationCommands(process.env.CLIENT_ID),
				{ body: commandData },
			);
			logger.info(`Successfully registered ${result.length} slash commands globally`);
		}
	}
	catch (err) {
		logger.error(err, 'Failed to register slash commands');
	}
};

export const loadCommands = async (client = null) => {
	const appStore = useAppStore();
	const commandData = [];
	const commands = new Collection();

	// If client is not passed, use app store client
	if (!client) {
		client = appStore.client;
	}

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
			logger.error(`Command ${file} is missing data or execute property`);
		}
	}
	// Set commands collection to app store
	appStore.commandsActionMap = commands;
	// Update slash commands
	await updateSlashCommands(process.env.GUILD_ID, commandData);
};

export const loadEvents = async (client = null) => {
	const appStore = useAppStore();

	// If client is not passed, use app store client
	if (!client) {
		client = appStore.client;
	}

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
		const subCommandNames = [];
		// Check if sub command has data and execute properties
		if ('data' in subCommand && 'execute' in subCommand) {
			// Add sub command to map
			subCommands.set(subCommand.data.name, subCommand);
			// Add sub command name to array
			subCommandNames.push(subCommand.data.name);
		}
		else {
			logger.error(`Sub command ${file} is missing data or execute property`);
		}
	}
	logger.info(`Successfully loaded ${subCommands.size} sub commands - [ ${subCommands.map((subCommand) => subCommand.data.name).join(', ')} ] for command ${commandName}`);
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
			logger.error(`Event ${file} is missing data or execute property`);
		}
	}
};

export const deleteGuildCommands = async () => {
	const rest = new REST().setToken(process.env.BOT_TOKEN);
	try {
		if (!process.env.GUILD_ID) {
			logger.error('GUILD_ID is not set in .env file');
			return;
		}

		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: [] },
		);

		logger.info('Successfully deleted guild commands.');
	}
	catch (err) {
		logger.error(err, 'Failed to delete guild commands');
	}
};

export const deleteGlobalCommands = async () => {
	const rest = new REST().setToken(process.env.BOT_TOKEN);
	try {
		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: [] },
		);
		logger.info('Successfully deleted global commands.');
	}
	catch (err) {
		logger.error(err, 'Failed to delete global commands');
	}
};