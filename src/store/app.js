import { defineStore } from 'pinia';
import { Collection } from 'discord.js';

export const useAppStore = defineStore('app', {
	state: () => ({
		client: null,
		commandsActionMap: null,
		cooldowns: new Collection(),

		cardsData: null,
	}),
	getters: {
		// <-- This is where you define your getters
	},
	actions: {
		// <-- This is where you define your actions
	},
});
