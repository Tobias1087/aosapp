const {
	warscroll_ability,
	warscroll,
	warscroll_keywords_keyword,
	keyword,
	description_subsection,
	weapon,
	table_row,
	table_cell,
} = require('./dump.json');

module.exports = warscroll.map(scroll => ({
	name: scroll.subname ? scroll.name + ' ' + scroll.subname : scroll.name,
	points: scroll.points,
	unitSize: scroll.unitSize,
	move: scroll.move,
	save: scroll.save,
	bravery: scroll.bravery,
	wounds: scroll.wounds,
	image: scroll.imageUrl,
	baseSize: scroll.baseSize,
	notes: scroll.notes,
	table: table_row
			.filter(row => row.tableId === scroll.id)
			.map(row => table_cell.filter(cell => cell.rowId === row.id)),
	descSubs: description_subsection
			.filter(desc => desc.warscrollId === scroll.id)
			.map(desc => ({ header: desc.header, rules: desc.rules })),
	weapons: weapon.filter(weap => weap.warscrollId === scroll.id),
	abilities: warscroll_ability.filter(ab => ab.warscrollId === scroll.id)
			.map(abil => ({ name: abil.name, rules: abil.rules })),
	keywords: warscroll_keywords_keyword.filter(
			wkk => wkk.warscrollId === scroll.id)
			.map(wkk => keyword.find(kw => wkk.keywordId === kw.id)?.name),
}));

