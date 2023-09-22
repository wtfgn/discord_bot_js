export const data = {
	name: 'emptyChannel',
	once: false,
};

export const execute = async (queue) => {
	// Emitted when the voice channel has been empty for the set threshold
	// Bot will automatically leave the voice channel with this event
	queue.metadata.channel.send(
		'Leaving because no vc activity for the past 5 minutes',
	);
};

export const isPlayerEvent = true;
