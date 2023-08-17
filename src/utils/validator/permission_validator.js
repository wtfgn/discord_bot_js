import { EmbedBuilder } from 'discord.js';
import { embedOptions } from '#/config/config.json';

export const cannotJoinVoiceOrTalk = async (interaction) => {
	const voiceChannel = interaction.member.voice.channel;

	if (!voiceChannel.joinable || !voiceChannel.speakable) {
		const embed = new EmbedBuilder();
		embed.setColor(embedOptions.colors.warning).setDescription('I do not have the correct permissions!\nPlease make sure I have the `CONNECT` and `SPEAK` permissions!');
		(interaction.deferred || interaction.replied) ?
			await interaction.editReply({ embeds: [embed] }) :
			await interaction.reply({ embeds: [embed], ephemeral: true });
		return true;
	}

	return false;
};

export const cannotSendMessageInChannel = async (interaction) => {
	const channel = interaction.channel;

	// only checks if channel is viewable, as bot will have permission to send interaction replies if channel is viewable
	if (!channel.viewable) {
		const embed = new EmbedBuilder();
		embed.setColor(embedOptions.colors.warning).setDescription('I do not have the correct permissions!\nPlease make sure I have the `VIEW_CHANNEL` permission!');
		// we can still send ephemeral replies in channels we can't view, so sending message to user instead
		await interaction.deferReply({ ephemeral: true });
		await interaction.editReply({ embeds: [embed] });
		return true;
	}

	return false;
};