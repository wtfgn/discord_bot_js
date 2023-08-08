import { SlashCommandSubcommandBuilder, ChannelType } from 'discord.js';
import { Guilds } from '@/schemas/guilds';

export const data = new SlashCommandSubcommandBuilder()
	.setName('remove_display_channel')
	.setDescription('Remove the channel where the number of guild members is displayed')
	.addChannelOption(option =>
		option
			.setName('channel')
			.setDescription('The channel')
			.setRequired(true)
			.addChannelTypes(ChannelType.GuildVoice),
	);

export const execute = async (interaction) => {
	const { options } = interaction;
	const channel = options.getChannel('channel');

	await interaction.reply({ content: 'Removing display channel...\n(If this message does not disappear, please wait 10 mins and try again)', ephemeral: true });

	// Get guild from DB
	const [ guild ] = await Guilds.findOrCreate({
		where: {
			guildId: interaction.guildId,
		},
	});

	// Check if channel is already set
	if (!guild.displayChannelID) {
		return await interaction.editReply({ content: 'Channel is not set', ephemeral: true });
	}

	// Check if channel is the same
	if (guild.displayChannelID !== channel.id) {
		return await interaction.editReply({ content: 'Channel is not the same', ephemeral: true });
	}

	// Remove channel
	await Guilds.update({
		displayChannelID: null,
		displayChannelName: null,
	}, {
		where: {
			guildId: interaction.guildId,
		},
	});

	// Set channel name
	await channel.setName(Guilds.displayChannelName);
	// Set channel permissions
	await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: true });

	// Reply to interaction
	await interaction.editReply({ content: 'Channel removed', ephemeral: true });
};