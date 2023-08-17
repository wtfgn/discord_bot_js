export const data = {
	name: 'emptyQueue',
	once: false,
};

export const execute = async (queue) => {
	// Emitted when the player queue has finished
	queue.metadata.channel.send('Queue finished!');
};

export const isPlayerEvent = true;