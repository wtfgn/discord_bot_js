import { SlashCommandSubcommandBuilder } from 'discord.js';
import * as fs from 'fs';
import path from 'path';
import configData from '../../config.json';


export const data = new SlashCommandSubcommandBuilder()
	.setName('remove_display_channel')
	.setDescription('Remove the channel where the number of guild members is displayed');

export const execute = async (interaction) => {
	const { guild } = interaction;
	const channel = guild.channels.cache.get(configData.displayChannelID);

	// Check if channel is already displaying the number of guild members
	if (!configData.displayChannelID) {
		return interaction.reply({
			content: 'There is no display channel set',
			ephemeral: true,
		});
	}

	// Set channel name
	await channel.setName('Voice Channel');
	// Set channel permissions
	await channel.permissionOverwrites.edit(guild.roles.everyone, { Connect : true });

	// Set config data
	configData.displayChannelID = null;
	// Write config data to file
	const filePath = path.resolve(__dirname, '../../config.json');
	fs.writeFileSync(filePath, JSON.stringify(configData, null, 4), (err) => {
		if (err) {
			console.error(err);
			return;
		}
	});

	await interaction.reply({
		content: `The channel <#${channel.id}> will no longer display the number of guild members`,
		ephemeral: true,
	});
};