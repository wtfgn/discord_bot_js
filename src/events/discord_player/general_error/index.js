export const data = {
	name: 'error',
	once: false,
};

export const execute = async (queue, error) => {
	// Emitted when the queue encounters error
	queue.metadata.channel.send(`Error: ${error.message}`);
	console.log(`General error event: ${error.message}`);
};

export const isPlayerEvent = true;