import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('bot')
	.setDescription('Info about the bot');

export const execute = async (interaction) => {
	const { client } = interaction;

	const embed = {
		color: 0x53bed4,
		timestamp: new Date(),

		footer: {
			text: interaction.user.tag,
			icon_url: interaction.user.displayAvatarURL(),
		},

		thumbnail: {
			url: client.user.displayAvatarURL(),
		},

		fields: [],

		image: {
			url: 'https://svgdb.me/assets/fullart/1233410200.png',
		},
	};

	embed.author = {
		name: client.user.tag,
		icon_url: client.user.displayAvatarURL(),

		url: client.user.displayAvatarURL(),

		// If the user is a bot, add the bot tag
		...(client.user.bot && { name: `${client.user.tag} [BOT]` }),

		// If the user is a system user, add the system tag
		...(client.user.system && { name: `${client.user.tag} [SYSTEM]` }),
	};

	embed.fields = [
		{
			name: 'ID',
			value: client.user.id,
			inline: true,
		},
		{
			name: 'Created at',
			value: client.user.createdAt,
			inline: true,
		},
		{
			name: 'Bot',
			value: client.user.bot ? 'Yes' : 'No',
			inline: true,
		},
		{
			name: 'Guilds',
			value: client.guilds.cache.size,
			inline: true,
		},
		{
			name: 'Users',
			value: client.users.cache.size,
			inline: true,
		},
		{
			name: 'Channels',
			value: client.channels.cache.size,
			inline: true,
		},
		{
			name: 'Uptime',
			value: `${Math.floor(client.uptime / 86400000)}d ${
				Math.floor(client.uptime / 3600000) % 24
			}h ${Math.floor(client.uptime / 60000) % 60}m ${
				Math.floor(client.uptime / 1000) % 60
			}s`,
			inline: true,
		},
	];

	const message = await interaction.reply({
		embeds: [embed],
		fetchReply: true,
	});
	const recievedEmbed = message.embeds[0];
	let imageURL = recievedEmbed.image.url;

	setInterval(async () => {
		imageURL =
			imageURL === 'https://svgdb.me/assets/fullart/1233410200.png'
				? 'https://svgdb.me/assets/fullart/1233410201.png'
				: 'https://svgdb.me/assets/fullart/1233410200.png';
		const editedEmbed = EmbedBuilder.from(recievedEmbed).setImage(imageURL);
		message.edit({ embeds: [editedEmbed] });
	}, 2000);
};
