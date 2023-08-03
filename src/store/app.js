import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
	state: () => ({
		client: null,
		commandsActionMap: null,
	}),
	getters: {
		// <-- This is where you define your getters
	},
	actions: {
		// <-- This is where you define your actions
	},
});
