import { SlashCommandSubcommandBuilder } from 'discord.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('server')
	.setDescription('Info about the server.');

export const execute = async (interaction) => {
	const { guild } = interaction;

	if (!guild.available) return interaction.reply('This server is not available.');

	const embed = {
		color: 0x53bed4,
		timestamp: new Date(),

		footer: {
			text: interaction.user.tag,
			icon_url: interaction.user.displayAvatarURL(),
		},

		thumbnail: {
			url: guild.iconURL(),
		},

		fields: [],
	};

	embed.author = {
		name: guild.name,
		icon_url: guild.iconURL(),

		url: guild.iconURL(),
	};

	embed.fields = [
		{
			name: 'ID',
			value: guild.id,
			inline: true,
		},
		{
			name: 'Created at',
			value: guild.createdAt,
			inline: true,
		},
		{
			name: 'Owner',
			value: guild.ownerId,
			inline: true,
		},
		{
			name: 'Members',
			value: guild.memberCount,
			inline: true,
		},
		{
			name: 'Channels',
			value: guild.channels.cache.size,
			inline: true,
		},
		{
			name: 'Roles',
			value: guild.roles.cache.size,
			inline: true,
		},
		{
			name: 'Emojis',
			value: guild.emojis.cache.size,
			inline: true,
		},
	];

	await interaction.reply({ embeds: [embed] });
};
