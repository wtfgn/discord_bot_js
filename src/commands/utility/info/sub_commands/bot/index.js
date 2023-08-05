import { SlashCommandSubcommandBuilder } from 'discord.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('bot')
	.setDescription('Info about the bot');

export const execute = async (interaction) => {
	const { client } = interaction;
	const { user } = client;


	await interaction.reply({
		embeds: [
			{
				title: 'Bot info',
				description: `Username: ${user.username}\nID: ${user.id}`,
				thumbnail: {
					url: user.displayAvatarURL({ dynamic: true }),
				},
			},
		],
	});
};