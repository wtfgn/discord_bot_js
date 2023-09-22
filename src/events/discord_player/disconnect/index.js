export const data = {
	name: 'disconnect',
	once: false,
};

export const execute = async (queue) => {
	// Emitted when the bot leaves the voice channel
	queue.metadata.channel.send('Looks like my job here is done, leaving now!');
};

export const isPlayerEvent = true;
