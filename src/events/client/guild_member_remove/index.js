import { Events } from 'discord.js';
import { memberCountGuilds } from '@/schemas/member_count_guilds';
import { logger } from '@/services/logger.js';

export const data = {
	name: Events.GuildMemberRemove,
};

export const execute = async (member) => {
	logger.debug(`User <${member.user.username}> left guild <${member.guild.name}>`);
	const guild = await memberCountGuilds.findOne({ where: { guildId: member.guild.id } });
	const displayChannel = member.guild.channels.cache.get(guild.displayChannelID);
	const guildMembersCount = member.guild.memberCount;

	// Check if display channel is set
	if (!displayChannel) return;

	// Set channel name
	await displayChannel.setName(`Members: ${guildMembersCount}`);
};