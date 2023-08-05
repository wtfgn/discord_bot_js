import { SlashCommandSubcommandBuilder } from 'discord.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('user')
	.setDescription('Info about a user')
	.addUserOption(option =>
		option
			.setName('target')
			.setDescription('The user'));

export const execute = async (interaction) => {
	const { options } = interaction;
	const target = options.getUser('target') ?? interaction.user;

	await interaction.reply(`Username: ${target.username}\nID: ${target.id}`);
};