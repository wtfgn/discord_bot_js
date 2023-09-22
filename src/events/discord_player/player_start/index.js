import { createNowPlayingEmbed } from '@/utils/creator/embeds/music_embeds.js';

export const data = {
	name: 'playerStart',
	once: false,
};

export const execute = async (queue, track) => {
	const { interaction, channel } = queue.metadata;
	const embed = createNowPlayingEmbed(queue, track, interaction);
	channel.send({ embeds: [embed] });
};

export const isPlayerEvent = true;
