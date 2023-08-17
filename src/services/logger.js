import { pino } from 'pino';
import { loggerOptions } from '#/config/config.json';

const targets = [
	{
		target: 'pino/file',
		level: loggerOptions.minimumLogLevel || 'debug',
		options: {
			destination: './logs/app-all.log',
			mkdir: true,
			sync: false,
		},
	},
	{
		target: 'pino/file',
		level: pino.levels.values.info,
		options: {
			destination: './logs/app-info.log',
			mkdir: true,
			sync: false,
		},
	},
	{
		target: 'pino/file',
		level: pino.levels.values.error,
		options: {
			destination: './logs/app-error.log',
			mkdir: true,
			sync: false,
		},
	},
	{
		target: 'pino-pretty',
		level: loggerOptions.minimumLogLevelConsole || 'info',
		options: {
			colorize: true,
			sync: false,
		},
	},
];

const transport = pino.transport({ targets });

const logLevelConfig = {
	level: loggerOptions.minimumLogLevel || 'debug',
	timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
	base: undefined,
};

export const logger = pino(logLevelConfig, transport);
