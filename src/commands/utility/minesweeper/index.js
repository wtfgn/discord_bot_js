import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('minesweeper')
	.setDescription('Play a game of minesweeper!')
	.addIntegerOption(option =>
		option
			.setName('width')
			.setDescription('The width of the minesweeper board')
			.setMaxValue(10)
			.setMinValue(1))
	.addIntegerOption(option =>
		option
			.setName('height')
			.setDescription('The height of the minesweeper board')
			.setMaxValue(10)
			.setMinValue(1))
	.addIntegerOption(option =>
		option
			.setName('mines')
			.setDescription('The amount of mines to place on the board')
			.setMaxValue(100)
			.setMinValue(1));

export const execute = async (interaction) => {
	const { options, channel } = interaction;
	const width = options.getInteger('width') ?? 10;
	const height = options.getInteger('height') ?? 10;
	const mines = options.getInteger('mines') ?? Math.floor(width * height / 10);

	// Create the board
	const board = createBoard(width, height, mines);

	// Send the board
	await channel.send(board);
	await interaction.reply({
		content: 'Sent the minesweeper board!',
		ephemeral: true,
	});
};

const createBoard = (width, height, mines) => {
	// Create the board
	const board = [];

	// Create the empty board
	for (let i = 0; i < height; i++) {
		board.push([]);
		for (let j = 0; j < width; j++) {
			board[i].push('||:black_large_square:||');
		}
	}

	// Place the mines
	for (let i = 0; i < mines; i++) {
		const x = Math.floor(Math.random() * width);
		const y = Math.floor(Math.random() * height);

		// If the square is already a mine, try again
		if (board[y][x] === '||:bomb:||') {
			i--;
			continue;
		}

		board[y][x] = '||:bomb:||';
	}

	// Place the numbers
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {

			// If the square is a mine, skip it
			if (board[i][j] === '||:bomb:||') {
				continue;
			}

			// Get the amount of mines around the square
			let minesAround = 0;
			for (let k = -1; k <= 1; k++) {
				for (let l = -1; l <= 1; l++) {

					// If the square is out of bounds, skip it
					// i + k < 0: above the board
					// i + k >= height: below the board
					// j + l < 0: left of the board
					// j + l >= width: right of the board
					if (i + k < 0 || i + k >= height || j + l < 0 || j + l >= width) {
						continue;
					}

					// If the square is a mine, increment the counter
					if (board[i + k][j + l] === '||:bomb:||') {
						minesAround++;
					}
				}
			}

			// Set the square to the amount of mines around it
			board[i][j] = `||:${getEmoji(minesAround)}:||`;
		}
	}

	// Create the board string
	let boardString = '';
	for (let i = 0; i < height; i++) {
		boardString += board[i].join('') + '\n';
	}

	return boardString;
};

const getEmoji = (number) => {
	switch (number) {
		case 0:
			return 'zero';
		case 1:
			return 'one';
		case 2:
			return 'two';
		case 3:
			return 'three';
		case 4:
			return 'four';
		case 5:
			return 'five';
		case 6:
			return 'six';
		case 7:
			return 'seven';
		case 8:
			return 'eight';
	}
};

// Cooldown
export const cooldown = 5;