import { Events } from 'discord.js';
import { useAppStore } from '@/store/app.js';

export const data = {
	name: Events.InteractionCreate,
};

export const execute = async interaction => {
	const appStore = useAppStore();
	const commandsActionMap = appStore.commandsActionMap;
	// Get command
	const command = commandsActionMap.get(interaction.commandName);

	// Check if it is a chat input command
	if (!interaction.isChatInputCommand()) return;
	// Check if command exists
	if (!command) {
		console.error(`Command ${interaction.commandName} does not exist`);
		return;
	}

	try {
		// Execute command
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		// If interaction is already replied or deferred
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
		else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	}
};

