export const subCommandExecutor = async (interaction, subCommands) => {
	const { options } = interaction;
	const { _subcommand: subcommandName } = options;
	const subCommand = subCommands.get(subcommandName);

	try {
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
