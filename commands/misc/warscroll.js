const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const warscrolls = require('../../data/convert');

const { getMarkdownTable, Align } = require('markdown-table-ts');

module.exports = {
	data: new SlashCommandBuilder()
			.setName('warscroll')
			.setDescription('Get the named warscroll')
			.addStringOption(option => option
					.setName('name')
					.setDescription('The name of the warscroll wanted')
					.setRequired(true)
					.setAutocomplete(true))
			.addBooleanOption(option => option
					.setName('share')
					.setDescription('Share to everyone')),
	async autocomplete(interaction) {
		const name = interaction.options.getFocused();

		await interaction.respond(warscrolls
				.filter(scroll => scroll.name.toLowerCase()
						.includes(name.toLowerCase()))
				.map(scroll => ({ name: scroll.name, value: scroll.name }))
				.slice(0, 25));
	}, async execute(interaction) {
		const name = interaction.options.getString('name');
		const shareOption = interaction.options.getBoolean('share') || false;

		const fs = warscrolls.find(
				scroll => scroll.name.toLowerCase() === name.toLowerCase());
		let meleeWeapons = fs.weapons
				.filter(w => w.type === 'melee')
				.map(w => ({
					name: w.name,
					value: `${w.range}/${w.attacks}/${w.hit}/${w.wound}/${w.rend}/${w.damage}`,
					inline: true,
				}));
		let missileWeapons = fs.weapons
				.filter(w => w.type === 'missile')
				.map(w => ({
					name: w.name,
					value: `${w.range}/${w.attacks}/${w.hit}/${w.wound}/${w.rend}/${w.damage}`,
					inline: true,
				}));
		const embed = new EmbedBuilder()
				.setTitle(fs.name)
				.addFields({ name: 'Move', value: '' + fs.move, inline: true },
						{ name: 'Save', value: '' + fs.save, inline: true },
						{ name: 'Bravery', value: '' + fs.bravery, inline: true },
						{ name: 'Wounds', value: '' + fs.wounds, inline: true });
		if (fs.table.length > 0) {
			const [head, ...body] = fs.table;

			const table = getMarkdownTable({
				table: {
					head: head.map(c => c.text), body: body.map(a => a.map(b => b.text)),
				}, alignColumns: true,
			});
			embed.addFields({
				name: 'Table', value: table,
			});
		}
		if (meleeWeapons.length > 0) {
			embed.addFields({ name: 'Melee Weapons', value: ' ' }, ...meleeWeapons);
		}
		if (missileWeapons.length > 0) {
			embed.addFields({ name: 'Missile Weapons', value: ' ' },
					...missileWeapons);
		}
		embed.addFields({ name: 'Abilities', value: ' ' },
				...fs.descSubs.map(d => ({ name: d.header, value: d.rules })),
				...fs.abilities.map(a => ({ name: a.name, value: a.rules })),
				{ name: 'Points', value: '' + fs.points, inline: true },
				{ name: 'Unit Size', value: '' + fs.unitSize, inline: true },
				{ name: 'Keywords', value: fs.keywords.join(',') });
		await interaction.reply({ embeds: [embed], ephemeral: !shareOption });
	},
};
