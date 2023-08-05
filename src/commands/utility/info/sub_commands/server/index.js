import { SlashCommandSubcommandBuilder } from 'discord.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('server')
	.setDescription('Info about the server.');

export const execute = async (interaction) => {
	// interaction.guild is the object representing the Guild in which the command was run
	await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
};
