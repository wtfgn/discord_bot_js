import { SlashCommandSubcommandBuilder } from 'discord.js';
import { useAppStore } from '@/store/app.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('volume')
	.setDescription('Set the volume of the music player')
	.addIntegerOption(option =>
		option
			.setName('percentage')
			.setDescription('The volume percentage')
			.setMaxValue(100)
			.setMinValue(1)
			.setRequired(true));

export const execute = async (interaction) => {
	const appStore = useAppStore();
	const { options, member } = interaction;
	const distube = appStore.distube;
	const voiceChannel = member.voice.channel;
	const volume = options.getInteger('percentage');

	distube.setVolume(voiceChannel, volume);
	return interaction.reply({ content: `Set the volume to \`${volume}%\``, ephemeral: true });
};