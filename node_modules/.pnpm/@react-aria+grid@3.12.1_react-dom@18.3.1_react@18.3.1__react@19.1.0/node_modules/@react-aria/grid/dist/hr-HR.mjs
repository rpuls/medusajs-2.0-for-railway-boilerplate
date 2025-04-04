var $e41234e934efb4f5$exports = {};
$e41234e934efb4f5$exports = {
    "deselectedItem": (args)=>`Stavka ${args.item} nije odabrana.`,
    "longPressToSelect": `Dugo pritisnite za ulazak u na\u{10D}in odabira.`,
    "select": `Odaberite`,
    "selectedAll": `Odabrane su sve stavke.`,
    "selectedCount": (args, formatter)=>`${formatter.plural(args.count, {
            "=0": `Nije odabrana nijedna stavka`,
            one: ()=>`Odabrana je ${formatter.number(args.count)} stavka`,
            other: ()=>`Odabrano je ${formatter.number(args.count)} stavki`
        })}.`,
    "selectedItem": (args)=>`Stavka ${args.item} je odabrana.`
};


export {$e41234e934efb4f5$exports as default};
//# sourceMappingURL=hr-HR.module.js.map
