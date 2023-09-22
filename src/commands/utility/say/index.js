import { SlashCommandBuilder } from 'discord.js';
import wait from 'node:timers/promises';

export const data = new SlashCommandBuilder()
	.setName('say')
	.setDescription('Replies with your input!')
	.addStringOption((option) =>
		option
			.setName('input')
			.setDescription('The input to echo back')
			.setRequired(true),
	);

export const execute = async (interaction) => {
	const { channel } = interaction;
	const input = interaction.options.getString('input');

	await interaction.reply({ content: 'Message sent!', ephemeral: true });

	// Send message
	await channel.sendTyping();
	await channel.send(input);

	// Reply to interaction
	await wait.setTimeout(3000);
	await interaction.deleteReply();
};
