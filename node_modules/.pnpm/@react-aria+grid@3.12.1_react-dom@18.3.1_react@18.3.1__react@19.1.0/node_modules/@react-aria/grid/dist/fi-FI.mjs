var $a33d71dc804cc59e$exports = {};
$a33d71dc804cc59e$exports = {
    "deselectedItem": (args)=>`Kohdetta ${args.item} ei valittu.`,
    "longPressToSelect": `Siirry valintatilaan painamalla pitk\xe4\xe4n.`,
    "select": `Valitse`,
    "selectedAll": `Kaikki kohteet valittu.`,
    "selectedCount": (args, formatter)=>`${formatter.plural(args.count, {
            "=0": `Ei yht\xe4\xe4n kohdetta valittu`,
            one: ()=>`${formatter.number(args.count)} kohde valittu`,
            other: ()=>`${formatter.number(args.count)} kohdetta valittu`
        })}.`,
    "selectedItem": (args)=>`${args.item} valittu.`
};


export {$a33d71dc804cc59e$exports as default};
//# sourceMappingURL=fi-FI.module.js.map
