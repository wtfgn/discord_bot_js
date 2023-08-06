import { Collection, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('info')
	.setDescription('Info about a user or a server');

export const execute = async (interaction) => {
	const { options } = interaction;
	const { _subcommand: subcommandName } = options;

	try {
		const subCommand = subCommands.get(subcommandName);
		await subCommand.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
		else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	}
};

export const hasSubCommands = true;
export const subCommands = new Collection();