import { SlashCommandSubcommandBuilder, ChannelType, codeBlock } from 'discord.js';
import * as fs from 'fs';
import path from 'path';
import configData from '../../config.json';


export const data = new SlashCommandSubcommandBuilder()
	.setName('set_display_channel')
	.setDescription('Set the channel where the number of guild members will be displayed')
	.addChannelOption(option =>
		option
			.setName('channel')
			.setDescription('The channel')
			.addChannelTypes(ChannelType.GuildVoice)
			.setRequired(true),
	);

export const execute = async (interaction) => {
	const { options, guild } = interaction;
	const channel = options.getChannel('channel');
	const guildMembersCount = guild.memberCount;

	// Check if channel is already displaying the number of guild members
	if (configData.displayChannelID) {
		return interaction.reply({
			content: `
			The channel <#${configData.displayChannelID}> is already displaying the number of guild members
			\nPlease remove the display channel first before setting a new one
			\n${codeBlock('/guild_members_count remove_display_channel')}`,
			ephemeral: true,
		});
	}

	// Set channel name
	await channel.setName(`Members: ${guildMembersCount}`);
	// Set channel permissions
	await channel.permissionOverwrites.edit(guild.roles.everyone, { Connect: false });

	// Set config data
	configData.displayChannelID = channel.id;
	// Write config data to file
	const filePath = path.resolve(__dirname, '../../config.json');
	fs.writeFileSync(filePath, JSON.stringify(configData, null, 4), (err) => {
		if (err) {
			console.error(err);
			return;
		}
	});

	await interaction.reply({
		content: `The channel <#${channel.id}> will now display the number of guild members`,
		ephemeral: true,
	});
};