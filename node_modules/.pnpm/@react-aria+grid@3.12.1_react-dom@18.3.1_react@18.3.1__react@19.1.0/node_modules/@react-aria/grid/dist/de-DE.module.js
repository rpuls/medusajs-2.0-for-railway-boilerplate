var $f8f1e72c8b5447d6$exports = {};
$f8f1e72c8b5447d6$exports = {
    "deselectedItem": (args)=>`${args.item} nicht ausgew\xe4hlt.`,
    "longPressToSelect": `Gedr\xfcckt halten, um Auswahlmodus zu \xf6ffnen.`,
    "select": `Ausw\xe4hlen`,
    "selectedAll": `Alle Elemente ausgew\xe4hlt.`,
    "selectedCount": (args, formatter)=>`${formatter.plural(args.count, {
            "=0": `Keine Elemente ausgew\xe4hlt`,
            one: ()=>`${formatter.number(args.count)} Element ausgew\xe4hlt`,
            other: ()=>`${formatter.number(args.count)} Elemente ausgew\xe4hlt`
        })}.`,
    "selectedItem": (args)=>`${args.item} ausgew\xe4hlt.`
};


export {$f8f1e72c8b5447d6$exports as default};
//# sourceMappingURL=de-DE.module.js.map
