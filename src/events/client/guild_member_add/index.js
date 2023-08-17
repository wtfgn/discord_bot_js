import { Events } from 'discord.js';
import { memberCountGuilds } from '@/schemas/member_count_guilds';

export const data = {
	name: Events.GuildMemberAdd,
};

export const execute = async (member) => {
	const guild = await memberCountGuilds.findOne({ where: { guildId: member.guild.id } });
	const displayChannel = member.guild.channels.cache.get(guild.displayChannelID);
	const guildMembersCount = member.guild.memberCount;

	// Check if display channel is set
	if (!displayChannel) return;

	// Set channel name
	await displayChannel.setName(`Members: ${guildMembersCount}`);
};