export const data = {
	name: 'debug',
	once: false,
};

export const execute = async (message) => {
	// Emitted when the queue encounters debug information
	console.log(`General player debug event: ${message}`);
};

export const isDebug = true;