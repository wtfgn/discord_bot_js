import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { logger } from '@/services/logger.js';

export default () => {
	try {
		logger.info('Initializing Vue.js...');

		const vue = createApp({});
		const pinia = createPinia();
		vue.use(pinia);

		logger.info('Successfully initialized Vue.js');
	}
	catch (err) {
		logger.error(err, 'Failed to initialize Vue.js');
		throw err;
	}
};
