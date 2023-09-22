export class PlayerData {
	constructor(user) {
		// user is a Discord.js User object
		this.user = user;
		// Health
		this.health = 100;
		this.maxHealth = 100;
		// Stats
		this.strength = 10;
		this.defense = 10;
		this.speed = 10;
		this.intelligence = 10;
		this.luck = 10;
		// Inventory
		this.inventory = [];
		// Equipment
		this.equipment = {
			weapon: null,
			armor: null,
			accessory: null,
		};
		// Currency
		this.gold = 0;
		// Experience
		this.xp = 0;
		this.level = 1;
		this.maxXp = 100;
		// Skills
		this.skillPoints = 0;
		this.skills = {
			// skillName: skillLevel
		};
		// Quests
		this.quests = [];
		this.questsCompleted = [];
		this.questsFailed = [];
		this.questsInProgress = [];
		// Other
		this.guild = null;
		this.party = null;
		this.location = null;
		this.lastLocation = null;
		this.lastLocationTime = null;
	}
}
