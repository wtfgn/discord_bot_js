import { EmbedBuilder } from 'discord.js';
import { embedOptions } from '#/config/config.json';
import { logger } from '@/services/logger.js';

export const notInVoiceChannel = async (interaction) => {
	if (!interaction.member.voice.channel) {
		const embed = new EmbedBuilder();
		embed
			.setColor(embedOptions.colors.warning)
			.setDescription('You must be in a voice channel to use this command!');
		interaction.deferred || interaction.replied
			? await interaction.editReply({ embeds: [embed] })
			: await interaction.reply({ embeds: [embed], ephemeral: true });

		logger.debug(
			`User <${interaction.user.username}> tried to use <${interaction.commandName}> command without being in a voice channel`,
		);
		return true;
	}

	return false;
};

export const notInSameVoiceChannel = async (interaction, queue) => {
	if (!queue.dispatcher) return true;

	if (interaction.member.voice.channel.id !== queue.dispatcher.channel.id) {
		const embed = new EmbedBuilder();
		embed
			.setColor(embedOptions.colors.warning)
			.setDescription(
				`You must be in the same voice channel as me to use this command!\n**Voice channel:** ${queue.dispatcher.channel.name}`,
			);
		interaction.deferred || interaction.replied
			? await interaction.editReply({ embeds: [embed] })
			: await interaction.reply({ embeds: [embed], ephemeral: true });

		logger.debug(
			`User <${interaction.user.username}> tried to use <${interaction.commandName}> command without being in the same voice channel as the bot`,
		);
		return true;
	}

	return false;
};
