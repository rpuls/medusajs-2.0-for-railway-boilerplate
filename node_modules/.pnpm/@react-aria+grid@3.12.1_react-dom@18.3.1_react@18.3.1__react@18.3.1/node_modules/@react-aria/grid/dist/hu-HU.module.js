var $1b0393182473bf9e$exports = {};
$1b0393182473bf9e$exports = {
    "deselectedItem": (args)=>`${args.item} nincs kijel\xf6lve.`,
    "longPressToSelect": `Nyomja hosszan a kijel\xf6l\xe9shez.`,
    "select": `Kijel\xf6l\xe9s`,
    "selectedAll": `Az \xf6sszes elem kijel\xf6lve.`,
    "selectedCount": (args, formatter)=>`${formatter.plural(args.count, {
            "=0": `Egy elem sincs kijel\xf6lve`,
            one: ()=>`${formatter.number(args.count)} elem kijel\xf6lve`,
            other: ()=>`${formatter.number(args.count)} elem kijel\xf6lve`
        })}.`,
    "selectedItem": (args)=>`${args.item} kijel\xf6lve.`
};


export {$1b0393182473bf9e$exports as default};
//# sourceMappingURL=hu-HU.module.js.map
