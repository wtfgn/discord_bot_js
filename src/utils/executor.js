export const subCommandExecutor = async (interaction, subCommands) => {
	const subCommandName = interaction.options.getSubcommand(true);
	const subCommand = subCommands.get(subCommandName);
	if (subCommand) {
		await subCommand.execute(interaction);
	}
};

export const subCommandAutocomplete = async (interaction, subCommands) => {
	const subCommandName = interaction.options.getSubcommand(true);
	const subCommand = subCommands.get(subCommandName);
	if (subCommand) {
		await subCommand.autocomplete(interaction);
	}
};
