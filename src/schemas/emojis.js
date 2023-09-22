import { sequelize } from '@/index.js';
import { DataTypes } from 'sequelize';

export const Emojis = sequelize.define(
	'emojis',
	{
		guildId: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		msgCreateEmojiId: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		msgReactionEmojiId: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
	},
	{
		timestamps: false,
	},
);
