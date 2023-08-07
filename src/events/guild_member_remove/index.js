import { Events } from 'discord.js';
import { displayChannelID } from '@/config.json';

export const data = {
	name: Events.GuildMemberRemove,
};

export const execute = async (member) => {
	const displayChannel = member.guild.channels.cache.get(displayChannelID);
	const guildMembersCount = member.guild.memberCount;

	// Check if display channel is set
	if (!displayChannel) return;

	// Set channel name
	await displayChannel.setName(`Members: ${guildMembersCount}`);
};