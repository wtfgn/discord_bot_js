import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('rock_paper_scissors')
	.setDescription('Play rock paper scissors.')
	.addUserOption(option =>
		option
			.setName('opponent')
			.setDescription('The user to play against.')
			.setRequired(true))
	.addIntegerOption(option =>
		option
			.setName('rounds')
			.setDescription('The number of rounds to play.')
			.setMaxValue(5)
			.setMinValue(1));


export const execute = async (interaction) => {
	const { options } = interaction;
	const rounds = options.getInteger('rounds') ?? 1;
	const opponent = options.getUser('opponent');

	if (opponent.id === interaction.user.id) {
		return interaction.reply({
			content: 'You cannot play against yourself!',
			ephemeral: true,
		});
	}

	const emojis = {
		rock: ':hand_splayed::skin-tone-1:',
		scissors: ':v::skin-tone-1:',
		paper: ':fist::skin-tone-1:',
	};

	const embed = new EmbedBuilder()
		.setTitle('Rock Paper Scissors')
		.setDescription(`You are playing against ${opponent.username}!`);

	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('rock')
				.setLabel('Rock')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('paper')
				.setLabel('Paper')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('scissors')
				.setLabel('Scissors')
				.setStyle(ButtonStyle.Primary),
		);

	const message = await interaction.reply({
		embeds: [embed],
		components: [row],
		fetchReply: true,
	});

	const filter = (i) => i.user.id === interaction.user.id || i.user.id === opponent.id;

	const collector = message.createMessageComponentCollector({ filter, time: 60000 });

	let playerWins = 0;
	let opponentWins = 0;

	let playerMove = null;
	let opponentMove = null;

	// If a player have selected a move, wait for the other player to select a move
	// If the other player doesn't select a move within 60 seconds, the game ends
	// If both players have selected a move, determine the winner
	collector.on('collect', async (componentInteraction) => {
		const { user } = componentInteraction;

		if (user.id === interaction.user.id) {
			embed.addFields({ name: `${componentInteraction.user.username}'s move`, value: `||${emojis[componentInteraction.customId]}||` });
			playerMove = componentInteraction.customId;
		}
		else {
			embed.addFields({ name: `${componentInteraction.user.username}'s move`, value: `||${emojis[componentInteraction.customId]}||` });
			opponentMove = componentInteraction.customId;
		}

		await componentInteraction.update({ embeds: [embed] });

		if (playerMove && opponentMove) {
			if (playerMove === opponentMove) {
				embed.addFields({ name: 'Result', value: 'Draw!' });
			}
			else if (
				(playerMove === 'rock' && opponentMove === 'scissors') ||
				(playerMove === 'scissors' && opponentMove === 'paper') ||
				(playerMove === 'paper' && opponentMove === 'rock')
			) {
				embed.addFields({ name: 'Result', value: `${interaction.user.username} wins!` });
				playerWins++;
			}
			else {
				embed.addFields({ name: 'Result', value: `${opponent.username} wins!` });
				opponentWins++;
			}

			playerMove = null;
			opponentMove = null;

			await message.edit({ embeds: [embed] });


			if (playerWins === rounds || opponentWins === rounds) {
				collector.stop();
			}

			return;
		}
	});

	collector.on('end', async () => {
		embed.addFields({
			name: 'Final Result',
			value: `${interaction.user.username}: ${playerWins}\n${opponent.username}: ${opponentWins}`,
		});
		await message.edit({ embeds: [embed], components: [] });
	});
};
