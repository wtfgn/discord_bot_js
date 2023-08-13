import { SlashCommandSubcommandBuilder, EmbedBuilder } from 'discord.js';
import { useAppStore } from '@/store/app.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('options')
	.setDescription('Select an option')
	.addStringOption(option =>
		option
			.setName('option')
			.setDescription('The option to select')
			.setRequired(true)
			.addChoices(
				{ name: 'Queue', value: 'queue' },
				{ name: 'Skip', value: 'skip' },
				{ name: 'Pause', value: 'pause' },
				{ name: 'Resume', value: 'resume' },
				{ name: 'Stop', value: 'stop' },
			));

export const execute = async (interaction) => {
	const appStore = useAppStore();
	const { options, member } = interaction;
	const distube = appStore.distube;
	const voiceChannel = member.voice.channel;
	const option = options.getString('option');
	const queue = distube.getQueue(voiceChannel);

	const embed = new EmbedBuilder();

	if (!queue) {
		embed.setColor('Red').setDescription('There is no queue!');
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	switch (option) {
		case 'queue': {
			const songs = queue.songs.map((song, index) => `${index + 1}. ${song.name} - \`${song.formattedDuration}\``).join('\n');
			embed.setColor('Green').setDescription(`**Current Song:**\n${queue.songs[0].name} - \`${queue.songs[0].formattedDuration}\`\n\n**Queue:**\n${songs}`);
			break;
		}
		case 'skip': {
			distube.skip(voiceChannel);
			embed.setColor('Green').setDescription('Skipped the current song!');
			break;
		}
		case 'pause': {
			distube.pause(voiceChannel);
			embed.setColor('Green').setDescription('Paused the current song!');
			break;
		}
		case 'resume': {
			distube.resume(voiceChannel);
			embed.setColor('Green').setDescription('Resumed the current song!');
			break;
		}
		case 'stop': {
			distube.stop(voiceChannel);
			embed.setColor('Green').setDescription('Stopped the queue!');
			break;
		}
		default:
			embed.setColor('Red').setDescription('Invalid option!');
	}

	return interaction.reply({ embeds: [embed], ephemeral: true });
};
