import { EmbedBuilder } from 'discord.js';
import { embedOptions } from '#/config/config.json';
import { logger } from '@/services/logger.js';

export const queueDoesNotExist = async (interaction, queue) => {
	if (!queue) {
		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.warning)
			.setDescription(
				`**${embedOptions.icons.warning} Oops!**\nThere are no tracks in the queue and nothing currently playing. First add some tracks with **\`/music play\`**!`,
			);

		interaction.deferred || interaction.replied
			? await interaction.editReply({ embeds: [embed] })
			: await interaction.reply({ embeds: [embed], ephemeral: true });

		logger.debug(
			`User <${interaction.user.username}> tried to use <${interaction.commandName}> command without a queue`,
		);
		return true;
	}

	return false;
};

export const queueNoCurrentTrack = async (interaction, queue) => {
	if (!queue.currentTrack) {
		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.warning)
			.setDescription(
				`**${embedOptions.icons.warning} Oops!**\nThere is nothing currently playing. First add some tracks with **\`/music play\`**!`,
			);

		interaction.deferred || interaction.replied
			? await interaction.editReply({ embeds: [embed] })
			: await interaction.reply({ embeds: [embed], ephemeral: true });

		logger.debug(
			`User <${interaction.user.username}> tried to use <${interaction.commandName}> command without a current track`,
		);
		return true;
	}

	return false;
};

export const queueIsEmpty = async (interaction, queue) => {
	if (queue.tracks.data.length === 0) {
		const embed = new EmbedBuilder()
			.setColor(embedOptions.colors.warning)
			.setDescription(
				`**${embedOptions.icons.warning} Oops!**\nThere are no tracks added to the queue. First add some tracks with **\`/music play\`**!`,
			);

		interaction.deferred || interaction.replied
			? await interaction.editReply({ embeds: [embed] })
			: await interaction.reply({ embeds: [embed], ephemeral: true });

		logger.debug(
			`User <${interaction.user.username}> tried to use <${interaction.commandName}> command without any tracks in the queue`,
		);
		return true;
	}

	return false;
};
