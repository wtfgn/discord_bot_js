import { sequelize } from '@/index.js';
import { DataTypes } from 'sequelize';

export const Alarms = sequelize.define(
	'alarms',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		guildId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		channelId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		message: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		time: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		timestamps: false,
	},
);
