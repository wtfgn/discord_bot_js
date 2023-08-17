export const data = {
	name: 'debug',
	once: false,
};

export const execute = async (queue, message) => {
	// Emitted when the player queue sends debug info
	// Useful for seeing what state the current queue is at
	console.log(`Player debug event: ${message}`);
};

export const isDebug = true;
export const isPlayerEvent = true;
