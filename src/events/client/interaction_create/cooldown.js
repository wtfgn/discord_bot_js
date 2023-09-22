import { Collection } from 'discord.js';
import { useAppStore } from '@/store/app.js';

// Check cooldown
export const checkCooldown = (interaction, command) => {
	const appStore = useAppStore();
	const cooldowns = appStore.cooldowns;
	const subCommandName = interaction.options.getSubcommand(false);
	const subCommand = command.subCommands
		? command.subCommands.get(subCommandName)
		: null;
	const commandName = command.subCommands
		? `${command.data.name} ${subCommandName}`
		: `${command.data.name}`;

	// If cooldowns collection does not have the command name, set it
	if (!cooldowns.has(commandName)) {
		cooldowns.set(commandName, new Collection());
	}

	const now = Date.now();
	// Timestamps = collection of user IDs and the time they last used the command
	const timestamps = cooldowns.get(commandName);
	const defaultCooldown = 3;
	// If cooldown is set, set it to the command's cooldown, otherwise set it to the default cooldown
	// Order of precedence: subCommand cooldown > command cooldown > default cooldown
	const commandCooldown =
		subCommand && subCommand.cooldown ? subCommand.cooldown : command.cooldown;
	const cooldownAmount = (commandCooldown || defaultCooldown) * 1000;
	// If timestamps collection has the user ID, set the expiration time
	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		// If the user is still in cooldown, return the time left
		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return { timeLeft, commandName };
		}
	}

	// If the user is not in cooldown, set the timestamp
	timestamps.set(interaction.user.id, now);
	// Delete the timestamp after the cooldown period ends
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	// Return false if the user is not in cooldown
	return { timeLeft: false, commandName };
};
