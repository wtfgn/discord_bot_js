import { SlashCommandSubcommandBuilder } from 'discord.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('user')
	.setDescription('Info about a user')
	.addUserOption((option) =>
		option.setName('target').setDescription('The user'),
	);

export const execute = async (interaction) => {
	const { options } = interaction;
	const target = options.getUser('target') ?? interaction.user;

	const embed = {
		color: 0x53bed4,
		timestamp: new Date(),

		footer: {
			text: interaction.user.tag,
			icon_url: interaction.user.displayAvatarURL(),
		},

		thumbnail: {
			url: target.displayAvatarURL(),
		},

		fields: [],
	};

	embed.author = {
		name: target.tag,
		icon_url: target.displayAvatarURL(),

		url: target.displayAvatarURL(),

		// If the user is a bot, add the bot tag
		...(target.bot && { name: `${target.tag} [BOT]` }),

		// If the user is a system user, add the system tag
		...(target.system && { name: `${target.tag} [SYSTEM]` }),
	};

	embed.fields = [
		{
			name: 'ID',
			value: target.id,
			inline: true,
		},
		{
			name: 'Created at',
			value: target.createdAt,
			inline: true,
		},
		{
			name: 'Bot',
			value: target.bot ? 'Yes' : 'No',
			inline: true,
		},
		{
			name: 'System',
			value: target.system ? 'Yes' : 'No',
			inline: true,
		},
		{
			name: 'Flags',
			value: target.flags.toArray().join(', ') || 'None',
			inline: true,
		},
		{
			name: 'Avatar URL',
			value: `[Click here](${target.displayAvatarURL()})`,
			inline: true,
		},
	];

	await interaction.reply({ embeds: [embed] });
};
