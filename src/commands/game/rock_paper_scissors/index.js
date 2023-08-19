import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { embedOptions } from '#/config/config.json';
import { logger } from '@/services/logger.js';

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
	const warningEmbed = new EmbedBuilder();
	let currentRound = 1;

	if (opponent.id === interaction.user.id) {
		warningEmbed
			.setColor(embedOptions.colors.warning)
			.setDescription(
				`**${embedOptions.icons.warning} You can't play against yourself!**`,
			);

		logger.debug(`User <${interaction.user.username}> tried to play rock paper scissors against themselves`);
		return interaction.reply({ embeds: [warningEmbed], ephemeral: true });
	}

	const emojis = {
		rock: ':hand_splayed::skin-tone-1:',
		scissors: ':v::skin-tone-1:',
		paper: ':fist::skin-tone-1:',
	};

	const embed = new EmbedBuilder()
		.setTitle('Rock Paper Scissors')
		.setDescription(`You are playing against ${opponent.username}!`)
		.setFooter({ text: `Round ${currentRound}/${rounds}` })
		.setColor(embedOptions.colors.default);

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

	const filter = (i) => {
		if (i.user.id !== interaction.user.id && i.user.id !== opponent.id) {
			warningEmbed
				.setColor(embedOptions.colors.warning)
				.setDescription(
					`**${embedOptions.icons.warning} You are not allowed to interact with this button!**`,
				);

			logger.debug(`User <${i.user.username}> tried to interact with rock paper scissors button but they are not allowed`);
			i.reply({ embeds: [warningEmbed], ephemeral: true });
			return false;
		}

		if ((i.user.id === interaction.user.id && playerMove) ||
			(i.user.id === opponent.id && opponentMove)) {
			warningEmbed
				.setColor(embedOptions.colors.warning)
				.setDescription(
					`**${embedOptions.icons.warning} You have already selected a move!**`,
				);

			logger.debug(`User <${i.user.username}> tried to interact with rock paper scissors button but they have already selected a move`);
			i.reply({ embeds: [warningEmbed], ephemeral: true });
			return false;
		}

		return true;
	};

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

		// Reset the timer
		collector.resetTimer({ time: 60000 });

		if (currentRound > 1 && !playerMove && !opponentMove) {
			embed.spliceFields(0, 25);
			message.edit({ embeds: [embed] });
		}

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

			currentRound = Math.max(playerWins, opponentWins) + 1;
			// Reset the moves
			playerMove = null;
			opponentMove = null;

			// Update the footer
			embed.setFooter({ text: `Round ${currentRound > rounds ? currentRound - 1 : currentRound}/${rounds}\n${interaction.user.username}: ${playerWins}\n${opponent.username}: ${opponentWins}` });

			// Update the embed
			await message.edit({ embeds: [embed] });


			if (playerWins === rounds || opponentWins === rounds) {
				collector.stop();
			}

			return;
		}
	});

	collector.on('end', async (collected, reason) => {
		if (reason === 'time') {
			logger.debug(`User <${interaction.user.username}> finished playing rock paper scissors against <${opponent.username}> because the game timed out`);
			embed.addFields({ name: 'Result', value: 'The game has ended because no one selected a move in 60 seconds!' });
		}

		embed
			.addFields({
				name: 'Final Result',
				value: `${interaction.user.username}: ${playerWins}\n${opponent.username}: ${opponentWins}`,
			})
			.setFooter({ text: 'The game has ended!' });

		logger.debug(`User <${interaction.user.username}> finished playing rock paper scissors against <${opponent.username}>`);
		await message.edit({ embeds: [embed], components: [] });
	});
};
