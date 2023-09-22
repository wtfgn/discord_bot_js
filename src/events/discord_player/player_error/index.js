export const data = {
	name: 'playerError',
	once: false,
};

export const execute = async (queue, error, track) => {
	// Emitted when the audio player errors while streaming audio track
	queue.metadata.channel.send(`Error playing **${track.title}**!`);
	console.log(`Player error event: ${error.message}`);
	console.log(error);
};

export const isPlayerEvent = true;
