import { SlashCommandSubcommandBuilder, ChannelType } from 'discord.js';
import { memberCountGuilds } from '@/schemas/member_count_guilds';
import { logger } from '@/services/logger.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('set_display_channel')
	.setDescription(
		'Set the channel where the number of guild members will be displayed',
	)
	.addChannelOption((option) =>
		option
			.setName('channel')
			.setDescription('The channel')
			.addChannelTypes(ChannelType.GuildVoice)
			.setRequired(true),
	);

export const execute = async (interaction) => {
	await interaction.reply({
		content:
			'Setting display channel...\n(If this message does not disappear, please wait 10 mins and try again)',
		ephemeral: true,
	});
	const { options } = interaction;
	const memberCount = interaction.guild.memberCount;
	const channel = options.getChannel('channel');

	logger.debug(
		`User <${interaction.user.username}> is trying to set display channel to <#${channel.id}>`,
	);

	// Get guild from DB, if not found, create one
	const [guild] = await memberCountGuilds.findOrCreate({
		where: {
			guildId: interaction.guildId,
		},
	});

	// Check if channel is already set
	if (guild.displayChannelID === channel.id) {
		logger.debug(
			`User <${interaction.user.username}> tried to set display channel but it was already set`,
		);
		return await interaction.editReply({
			content: 'Channel is already set',
			ephemeral: true,
		});
	}

	// Switch to another channel
	if (guild.displayChannelID) {
		// Get old channel
		const oldChannel = await interaction.guild.channels.cache.get(
			guild.displayChannelID,
		);
		const oldChannelName = guild.displayChannelName;

		// Set channel name
		await oldChannel.setName(oldChannelName);
		// Set channel permissions
		await oldChannel.permissionOverwrites.edit(
			interaction.guild.roles.everyone,
			{ Connect: true },
		);

		logger.debug(
			`User <${interaction.user.username}> switched display channel from <#${oldChannel.id}> to <#${channel.id}>`,
		);
	}

	// Update channel
	await memberCountGuilds.update(
		{
			displayChannelID: channel.id,
			displayChannelName: channel.name,
		},
		{
			where: {
				guildId: interaction.guildId,
			},
		},
	);

	// Set channel name
	await channel.setName(`Members: ${memberCount}`);
	// Set channel permissions
	await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
		Connect: false,
	});

	// Reply to interaction
	await interaction.editReply({
		content: `<#${channel.id}> will now display the number of guild members`,
		ephemeral: true,
	});
	logger.debug(
		`User <${interaction.user.username}> has successfully set display channel to <#${channel.id}>`,
	);
};
