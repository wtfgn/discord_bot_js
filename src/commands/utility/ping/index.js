import { SlashCommandBuilder } from 'discord.js';
import wait from 'node:timers/promises';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!');

export const execute = async (interaction) => {
	const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
	interaction.editReply(`Pong!\nRoundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms\nWebsocket heartbeat: ${interaction.client.ws.ping}ms`);
	await wait.setTimeout(5000);
	interaction.followUp(`Pong again!\nRoundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms\nWebsocket heartbeat: ${interaction.client.ws.ping}ms`);
	interaction.deleteReply();
};

// Cooldown
export const cooldown = 5;
