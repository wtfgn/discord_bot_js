import { Events } from 'discord.js';
import { useAppStore } from '@/store/app.js';

export const data = {
	name: Events.InteractionCreate,
	once: false,
};

export const execute = async interaction => {
	const appStore = useAppStore();
	const commandsActionMap = appStore.commandsActionMap;
	if (!interaction.isCommand()) return;
	if (!commandsActionMap.has(interaction.commandName)) return;
	try {
		// Execute command
		await commandsActionMap.get(interaction.commandName)(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
};

