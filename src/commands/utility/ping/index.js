import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!');

export const execute = async (interaction) => {
	const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
	interaction.editReply({
		content: `Pong!\nRoundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms\nWebsocket heartbeat: ${interaction.client.ws.ping}ms`,
		emphemeral: true,
	});
};

// Cooldown
export const cooldown = 5;
