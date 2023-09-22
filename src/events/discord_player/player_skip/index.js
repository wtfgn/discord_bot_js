export const data = {
	name: 'playerSkip',
	once: false,
};

export const execute = async (queue, track) => {
	// Emitted when the audio player fails to load the stream for a song
	queue.metadata.channel.send(`Skipping **${track.title}** due to an issue!`);
};

export const isPlayerEvent = true;
