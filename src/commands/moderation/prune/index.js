import { SlashCommandBuilder, inlineCode } from 'discord.js';
import wait from 'node:timers/promises';

export const data = new SlashCommandBuilder()
	.setName('prune')
	.setDescription('Prune messages from a channel')
	.addIntegerOption((option) =>
		option
			.setName('amount')
			.setDescription('The amount of messages to prune')
			.setMaxValue(100)
			.setMinValue(1),
	)
	.addUserOption((option) =>
		option.setName('target').setDescription('The user to prune messages from'),
	);

export const execute = async (interaction) => {
	const { options, channel } = interaction;
	const amount = options.getInteger('amount') ?? 1;
	const target = options.getUser('target') ?? null;
	let deletedMessages = null;

	if (target) {
		const messages = await channel.messages.fetch({ limit: amount });
		const messagesToDelete = messages.filter(
			(message) => message.author.id === target.id,
		);
		if (messagesToDelete.size === 0) {
			return interaction.reply({
				content: 'No messages found from that user!',
				ephemeral: true,
			});
		}
		deletedMessages = await channel.bulkDelete(messagesToDelete, true);
	}
	else {
		deletedMessages = await channel.bulkDelete(amount, true);
	}

	await interaction.reply({
		content: `Pruned ${inlineCode(deletedMessages.size)} message(s)${
			target ? ` from ${target.tag}` : ''
		}`,
		ephemeral: true,
	});
	await wait.setTimeout(3000);
	await interaction.deleteReply();
};

// Cooldown
export const cooldown = 5;
