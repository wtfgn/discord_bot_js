import { SlashCommandSubcommandBuilder, EmbedBuilder, inlineCode } from 'discord.js';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import cardConfigData from '#/config/sv_config.json';
import { useAppStore } from '@/store/app.js';

export const data = new SlashCommandSubcommandBuilder()
	.setName('search')
	.setDescription('Search for a card')
	.addStringOption((option) =>
		option
			.setName('cardpack')
			.setDescription('The card pack to search from')
			.setAutocomplete(true))
	.addStringOption((option) =>
		option
			.setName('craft')
			.setDescription('The craft to search from')
			.addChoices(...cardConfigData.crafts.map((craft) => ({ name: craft, value: craft }))))
	.addStringOption((option) =>
		option
			.setName('rarity')
			.setDescription('The rarity to search from')
			.addChoices(...cardConfigData.rarities.map((rarity) => ({ name: rarity, value: rarity }))))
	.addStringOption((option) =>
		option
			.setName('type')
			.setDescription('The type to search from')
			.addChoices(...cardConfigData.types.map((type) => ({ name: type, value: type }))))
	.addIntegerOption((option) =>
		option
			.setName('cost')
			.setDescription('The cost to search from')
			.setMaxValue(100)
			.setMinValue(0))
	.addIntegerOption((option) =>
		option
			.setName('attack')
			.setDescription('The attack to search from')
			.setMaxValue(100)
			.setMinValue(0))
	.addIntegerOption((option) =>
		option
			.setName('defense')
			.setDescription('The defense to search from')
			.setMaxValue(100)
			.setMinValue(0));

export const execute = async (interaction) => {
	const appStore = useAppStore();
	const cardsData = appStore.cardsData;

	// Get options
	const cardPack = interaction.options.getString('cardpack');
	const craft = interaction.options.getString('craft');
	const rarity = interaction.options.getString('rarity');
	const type = interaction.options.getString('type');
	const cost = interaction.options.getInteger('cost');
	const attack = interaction.options.getInteger('attack');
	const defense = interaction.options.getInteger('defense');


	// Filter cards
	const filteredCards = Object.values(cardsData).filter((card) => {
		// Filter by card pack
		if (cardPack && card.expansion_ !== cardPack) return false;

		// Filter by craft
		if (craft && card.craft_ !== craft) return false;

		// Filter by rarity
		if (rarity && card.rarity_ !== rarity) return false;

		// Filter by type
		if (type && card.type_ !== type) return false;

		// Filter by cost
		if (cost && card.pp_ !== cost) return false;

		// Filter by attack
		if (attack && card.baseAtk_ !== attack) return false;

		// Filter by defense
		if (defense && card.baseDef_ !== defense) return false;

		return true;
	});

	// Check if there are any cards
	if (filteredCards.length === 0) {
		return interaction.reply({
			content: 'No cards found!',
			ephemeral: true,
		});
	}

	const cardPerPage = 25;
	const totalPages = Math.ceil(filteredCards.length / cardPerPage);
	let currentPage = 0;

	// Create embed
	const cardEmbed = createCardEmbed(filteredCards[0], currentPage, totalPages);

	// Create action row
	const selectMenuRow = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('cardSelectMenu')
				.setPlaceholder('Select a card')
				.setOptions(createSelectMenuOptions(filteredCards.slice(0, cardPerPage))),
		);

	const buttonsRow = new ActionRowBuilder()
		.addComponents(
			// Show the previous cardPerPage cards in the selection menu and refresh the embed, if any
			new ButtonBuilder()
				.setCustomId('previousButton')
				.setLabel('Previous')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(true),
		)
		.addComponents(
			// Show the next cardPerPage cards in the selection menu and refresh the embed, if any
			new ButtonBuilder()
				.setCustomId('nextButton')
				.setLabel('Next')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(filteredCards.length <= cardPerPage),
		);

	// Send message
	const message = await interaction.reply({
		embeds: [cardEmbed],
		components: [selectMenuRow, buttonsRow],
		fetchReply: true,
		ephemeral: true,
	});

	// Create collector
	const collector = message.createMessageComponentCollector({
		filter: (componentInteraction) => componentInteraction.user.id === interaction.user.id,
		time: 60000,
	});

	// Handle the collector
	collector.on('collect', async (componentInteraction) => {
		// Reset the collector timer
		collector.resetTimer();

		// Handle the selection menu
		if (componentInteraction.isStringSelectMenu()) {
			// Get the selected card
			const selectedCard = filteredCards.find((card) => card.id_ === parseInt(componentInteraction.values[0]));

			// Create embed
			const selectedCardEmbed = createCardEmbed(selectedCard, currentPage, totalPages);

			// Edit message
			await componentInteraction.update({
				embeds: [selectedCardEmbed],
			});
		}

		// Handle the previous button
		if (componentInteraction.customId === 'previousButton') {
			// Get the previous page
			const previousPage = --currentPage;

			// Get the previous cards
			const previousCards = filteredCards.slice(previousPage * cardPerPage, (previousPage + 1) * cardPerPage);

			// Create new options
			const newOptions = createSelectMenuOptions(previousCards);

			selectMenuRow.components[0].setOptions(newOptions);

			// Disable the previous button if it reaches the first page
			if (previousPage === 0) {
				buttonsRow.components[0].setDisabled(true);
			}

			// Enable the next button
			buttonsRow.components[1].setDisabled(false);

			// Create embed
			const previousCardEmbed = createCardEmbed(previousCards[0], previousPage, totalPages);

			// Edit message
			await componentInteraction.update({
				embeds: [previousCardEmbed],
				components: [selectMenuRow, buttonsRow],
			});
		}

		// Handle the next button
		if (componentInteraction.customId === 'nextButton') {
			// Get the next page
			const nextPage = ++currentPage;

			// Get the next cards
			const nextCards = filteredCards.slice(nextPage * cardPerPage, (nextPage + 1) * cardPerPage);

			// Create new options
			const newOptions = createSelectMenuOptions(nextCards);

			selectMenuRow.components[0].setOptions(newOptions);

			// Check if the next page is the last page
			if (nextPage === totalPages - 1) {
				buttonsRow.components[1].setDisabled(true);
			}

			// Enable the previous button
			buttonsRow.components[0].setDisabled(false);

			// Create embed
			const nextCardEmbed = createCardEmbed(nextCards[0], nextPage, totalPages);

			// Edit message
			await componentInteraction.update({
				embeds: [nextCardEmbed],
				components: [selectMenuRow, buttonsRow],
			});
		}
	});

	// Handle the end of the collector
	collector.on('end', async (collected, reason) => {
		if (reason === 'time') {
			await interaction.editReply({
				content: 'The card selection menu has timed out.',
				components: [],
			});
		}
	});
};

export const autocomplete = async (interaction) => {
	const focusedOption = interaction.options.getFocused(true);
	const choices = cardConfigData.cardPacks;
	const optionPerPage = 25;
	const filteredChoices = choices.filter((choice) => choice.toLowerCase().includes(focusedOption.value.toLowerCase())).slice(0, optionPerPage);
	const finalChoices = filteredChoices.map((choice) => ({
		name: choice,
		value: choice,
	}));
	await interaction.respond(finalChoices);
};

const createCardEmbed = (card, currentPage, totalPages) => {
	return new EmbedBuilder()
		.setTitle(card.name_)
		.setDescription(
			`${card.baseFlair_ || 'None'}

			${card.evoFlair_ || 'None'}`)
		.addFields({
			name: '**Card Info**',
			value:
			`**Expansion:**
			${card.expansion_}

			**Class:**
			${card.craft_}

			**Rarity:**
			${card.rarity_}

			**Type:**
			${card.type_}

			**Cost:**
			${card.pp_}`,
			inline: true,
		})
		.addFields({
			name: '**Stats**',
			value:
			`**Attack:** ${inlineCode(card.baseAtk_)} -> ${inlineCode(card.evoAtk_)}
			
			**Defense:** ${inlineCode(card.baseDef_)} -> ${inlineCode(card.evoDef_)}`,
			inline: true,
		})
		.addFields({
			name: '**Base Effect**',
			value: `${card.baseEffect_ || 'None'}`,
			inline: false,
		})
		.addFields({
			name: '**Evo Effect**',
			value: `${card.evoEffect_ || 'None'}`,
			inline: false,
		})
		.setColor(cardConfigData.cardRarityColors[card.rarity_])
		.setThumbnail('https://svgdb.me/assets/emblems/em_1233410200_m.png')
		.setImage(`https://svgdb.me/assets/fullart/${card.id_}0.png`)
		.setFooter({ text: `Card ID: ${card.id_} | Page ${currentPage + 1} of ${totalPages}` });
};

const createSelectMenuOptions = (cards) => {
	return cards.map((card) =>
		new StringSelectMenuOptionBuilder()
			.setLabel(`${card.name_}`)
			.setValue(`${card.id_}`)
			.setDescription(`${card.expansion_} ${card.craft_} ${card.rarity_} ${card.type_} ${card.pp_}pp ${card.baseAtk_}/${card.baseDef_}`));
};