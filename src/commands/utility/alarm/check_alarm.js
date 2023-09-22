import { Alarms } from '@/schemas/alarms.js';
import dayjs from 'dayjs';

export const checkAlarm = async (client) => {
	const alarms = await Alarms.findAll();
	alarms.forEach((alarm) => {
		const { time, channelId, message, guildId, userId } = alarm.dataValues;
		if (dayjs().isAfter(time)) {
			const guild = client.guilds.cache.get(guildId);
			const user = client.users.cache.get(userId);
			const channel = guild.channels.cache.get(channelId);
			channel.send(`${user} ${message}`);
			alarm.destroy();
		}
	});
};
