import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { useAppStore } from '@/store/app.js';
import { logger } from '@/services/logger.js';
import { embedOptions } from '#/config/config.json';

export const data = new SlashCommandSubcommandBuilder()
	.setName('remove')
	.setDescription('Remove the current timer.');

export const execute = async (interaction) => {
	const appStore = useAppStore();
	const { user } = interaction;

	const timer = appStore.timers.get(user.id);

	if (!timer) {
		logger.debug(
			`User ${user.username}#${user.discriminator} (${user.id}) tried to remove a timer, but there is no timer set.`,
		);

		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.warning)
			.setDescription(
				`**${embedOptions.icons.warning} There is no timer set!**`,
			);

		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	try {
		clearInterval(timer);
		appStore.timers.delete(user.id);
	}
	catch (error) {
		logger.error(
			`User ${user.username}#${user.discriminator} (${user.id}) tried to remove a timer, but there was an error: ${error.message}`,
		);

		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.error)
			.setDescription(
				`**${embedOptions.icons.error} There was an error removing your timer!**`,
			);

		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	logger.debug(
		`User ${user.username}#${user.discriminator} (${user.id}) removed their timer.`,
	);

	const embed = new EmbedBuilder()
		.setColor(embedOptions.colors.success)
		.setDescription(`**${embedOptions.icons.success} Timer removed!**`);

	return interaction.reply({ embeds: [embed], ephemeral: true });
};
