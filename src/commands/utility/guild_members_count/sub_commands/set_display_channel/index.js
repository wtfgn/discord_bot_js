import { SlashCommandSubcommandBuilder, ChannelType } from 'discord.js';
import { Guilds } from '@/schemas/guilds';


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
	await interaction.reply({ content: 'Setting display channel...\n(If this message does not disappear, please wait 10 mins and try again)', ephemeral: true });
	const { options } = interaction;
	const memberCount = interaction.guild.memberCount;
	const channel = options.getChannel('channel');

	// Get guild from DB
	const [ guild ] = await Guilds.findOrCreate({
		where: {
			guildId: interaction.guildId,
		},
	});

	// Check if channel is already set
	if (guild.displayChannelID === channel.id) {
		return await interaction.editReply({ content: 'Channel is already set', ephemeral: true });
	}

	// Switch to another channel
	if (guild.displayChannelID) {
		const oldChannel = await interaction.guild.channels.cache.get(guild.displayChannelID);
		const oldChannelName = guild.displayChannelName;

		// Set channel name
		await oldChannel.setName(oldChannelName);
		// Set channel permissions
		await oldChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: true });
	}

	// Update channel
	await Guilds.update({
		displayChannelID: channel.id,
		displayChannelName: channel.name,
	}, {
		where: {
			guildId: interaction.guildId,
		},
	});

	// Set channel name
	await channel.setName(`Members: ${memberCount}`);
	// Set channel permissions
	await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: false });

	// Reply to interaction
	await interaction.editReply({ content: `<#${channel.id}> will now display the number of guild members`, ephemeral: true });
};