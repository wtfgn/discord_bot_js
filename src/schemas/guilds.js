import { sequelize } from '@/index.js';
import { DataTypes } from 'sequelize';

export const Guilds = sequelize.define('guilds', {
	guildId: {
		type: DataTypes.STRING,
		primaryKey: true,
	},
	displayChannelID: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	displayChannelName: {
		type: DataTypes.STRING,
		allowNull: true,
	},
});
