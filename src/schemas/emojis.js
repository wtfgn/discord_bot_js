import { sequelize } from '@/index.js';
import { DataTypes } from 'sequelize';

export const Emojis = sequelize.define(
	'emojis',
	{
		guildId: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		seenEmojiId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		reactionEmojiId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		timestamps: false,
	},
);
