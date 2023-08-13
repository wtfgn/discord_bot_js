import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, Collection } from 'discord.js';
import { subCommandExecutor } from '@/core/executor.js';

export const data = new SlashCommandBuilder()
	.setName('music')
	.setDescription('Complete music system');

export const execute = async (interaction) => {
	const { member, guild } = interaction;
	const voiceChannel = member.voice.channel;

	const embed = new EmbedBuilder();

	// Check if the user is in a voice channel
	if (!voiceChannel) {
		embed.setColor('Red').setDescription('You must be in a voice channel to use this command!');
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	// Check if the client is already in a voice channel
	const clientVoiceChannel = guild.members.cache.get(interaction.client.user.id).voice.channel;
	if (clientVoiceChannel && clientVoiceChannel.channelId !== voiceChannel.id) {
		embed.setColor('Red').setDescription(`I am already in <#${clientVoiceChannel.id}>!`);
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	// Check if the user is in the same voice channel as the client
	if (clientVoiceChannel && clientVoiceChannel.channelId === voiceChannel.id) {
		embed.setColor('Red').setDescription(`You are already in <#${voiceChannel.id}>!`);
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	// Check if the user has the correct permissions
	const permissions = voiceChannel.permissionsFor(guild.members.cache.get(interaction.client.user.id));
	if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
		embed.setColor('Red').setDescription('I do not have the correct permissions!\nPlease make sure I have the `CONNECT` and `SPEAK` permissions!');
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	// Execute the sub command
	await subCommandExecutor(interaction, subCommands);

};

export const subCommands = new Collection();