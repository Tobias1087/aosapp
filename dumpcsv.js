const {
	spell_lore_group,
	spell_lore,
	warscroll_ability,
	warscroll,
	faction,
	warscroll_factions_faction,
	warscroll_keywords_keyword,
	keyword,
	description_subsection,
	weapon,
	table_row,
	table_cell,
} = require('./data/dump.json');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
	path: './data/spells.csv', header: [
		{ id: 'name', title: 'NAME' },
		{ id: 'faction', title: 'FACTION' },
		{ id: 'spell_lore', title: 'LORE' },
		{ id: 'warscroll', title: 'WARSCROLL' },
		{ id: 'casting_value', title: 'CV' },
		{ id: 'range', title: 'RANGE' },
		{ id: 'rules', title: 'RULES' }],
});
const extractCV = (rules) => rules.match(
		/has a casting value of (?<cv>\d+)/)?.groups.cv;
const extractRange = (rules) => rules.match(
		/a range of (?<range>\d+")/)?.groups.range;
const extractFaction = id => faction.find(fact => fact.id === id);

const records = spell_lore.map(spell => {
	let group = spell_lore_group.find(
			group => group.id === spell.spellLoreGroupId);
	return ({
		name: spell.name,
		faction: extractFaction(group.factionId)?.name,
		spell_lore: group.name,
		casting_value: extractCV(spell.rules),
		range: extractRange(spell.rules),
		rules: spell.rules,
	});
});
const warscrollSpells = warscroll_ability.filter(
		ability => ability.rules.includes('is a spell')).map(spell => ({
	name: spell.name,
	faction: warscroll_factions_faction.filter(
			wff => wff.warscrollId === spell.warscrollId)
			.map(a => extractFaction(a.factionId))
			.map(fact => fact.name)
			.join('|'),
	warscroll: warscroll.find(
			warscroll => warscroll.id === spell.warscrollId).name,
	casting_value: extractCV(spell.rules),
	range: extractRange(spell.rules),
	rules: spell.rules,
}));

csvWriter.writeRecords(records.concat(warscrollSpells))
		.then(() => {console.log('...Done');});

const locuses = warscroll_keywords_keyword.filter(
		kw => kw.keywordId === '22ed9828-9970-4414-ae13-c47bb66c6223')
		.map(kw => warscroll.find(scroll => scroll.id === kw.warscrollId))
		.map(ws => ({
			name: ws.name,
			points: ws.points,
			faction: warscroll_factions_faction.filter(
					wff => wff.warscrollId === ws.id)
					.map(a => extractFaction(a.factionId))
					.map(fact => fact.name)
					.join('|'),
		}));
const locusWriter = createCsvWriter({
	path: './data/locus.csv', header: [
		{ id: 'name', title: 'NAME' },
		{ id: 'points', title: 'POINTS' },
		{ id: 'faction', title: 'FACTION' }],
});
locusWriter.writeRecords(locuses).then(() => console.log('...locus'));


const mounts = description_subsection
		.filter(desc => desc.header === 'Mount')
		.map(d => ({
			name: warscroll.find(s => s.id === d.warscrollId).name,
			mount: d.rules,
		}));
const mountsWriter = createCsvWriter({
	path: './data/mounts.csv', header: [
		{ id: 'name', title: 'NAME' },
		{ id: 'mount', title: 'MOUNT' },
	],
});
mountsWriter.writeRecords(mounts).then(() => console.log('...mounts'));


