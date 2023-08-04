import { Collection } from 'discord.js';
import { useAppStore } from '@/store/app.js';

// Check cooldown
export const checkCooldown = (interaction, command) => {
	const appStore = useAppStore();
	const cooldowns = appStore.cooldowns;

	// If cooldowns collection does not have the command name, set it
	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	// Timestamps = collection of user IDs and the time they last used the command
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldown = 3;
	// If cooldown is set, set it to the command's cooldown, otherwise set it to the default cooldown
	const cooldownAmount = (command.cooldown || defaultCooldown) * 1000;

	// If timestamps collection has the user ID, set the expiration time
	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		// If the user is still in cooldown, return the time left
		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return timeLeft;
		}
	}

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
	return 0;
};