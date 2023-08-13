import { SlashCommandSubcommandBuilder } from 'discord.js';
import { useAppStore } from '@/store/app.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('play')
	.setDescription('Play a song')
	.addStringOption(option =>
		option
			.setName('query')
			.setDescription('Provide the name or url for the song')
			.setRequired(true));

export const execute = async (interaction) => {
	const { options, member, channel } = interaction;
	const query = options.getString('query');
	const voiceChannel = member.voice.channel;
	const appStore = useAppStore();

	await interaction.deferReply({ ephemeral: true });

	try {
		await appStore.distube.play(voiceChannel, query, { member: member });
		await interaction.editReply({ content: `Playing \`${query}\``, ephemeral: true });
	}
	catch (error) {
		console.error(error);
		await interaction.editReply({ content: `There was an error while executing this command!\n\`\`\`${error}\`\`\``, ephemeral: true });
	}
};