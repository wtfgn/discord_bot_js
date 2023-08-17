import { Events } from 'discord.js';
import { useAppStore } from '@/store/app.js';
import { checkCooldown } from './cooldown.js';

export const data = {
	name: Events.InteractionCreate,
};

export const execute = async interaction => {
	const appStore = useAppStore();
	const commandsActionMap = appStore.commandsActionMap;
	// Get command
	const command = commandsActionMap.get(interaction.commandName);
	// Respond to autocomplete interactions

	// Check if it is a chat input command
	if (interaction.isChatInputCommand()) {
		// Check if command exists
		if (!command) {
			console.error(`Command ${interaction.commandName} does not exist`);
			return;
		}

		// Check cooldown
		const { timeLeft, commandName } = checkCooldown(interaction, command);
		if (timeLeft) {
			return interaction.reply({
				content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${commandName}\` command.`,
				ephemeral: true,
			});
		}

		// Execute command
		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			// If interaction is already replied or deferred
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: `There was an error while executing this command!\n\`\`\`${error}\`\`\``,
					ephemeral: true,
				});
			}
			else {
				await interaction.reply({
					content: `There was an error while executing this command!\n\`\`\`${error}\`\`\``,
					ephemeral: true,
				});
			}
		}
	}
	else if (interaction.isAutocomplete()) {
		if (!command) {
			console.error(`Command ${interaction.commandName} does not exist`);
			return;
		}

		// Execute autocomplete
		try {
			await command.autocomplete(interaction);
		}
		catch (error) {
			console.error(error);
		}
	}
};