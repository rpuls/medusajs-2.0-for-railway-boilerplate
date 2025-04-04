var $583de0b3587601b9$exports = {};
$583de0b3587601b9$exports = {
    "deselectedItem": (args)=>`${args.item} not selected.`,
    "select": `Select`,
    "selectedCount": (args, formatter)=>`${formatter.plural(args.count, {
            "=0": `No items selected`,
            one: ()=>`${formatter.number(args.count)} item selected`,
            other: ()=>`${formatter.number(args.count)} items selected`
        })}.`,
    "selectedAll": `All items selected.`,
    "selectedItem": (args)=>`${args.item} selected.`,
    "longPressToSelect": `Long press to enter selection mode.`
};


export {$583de0b3587601b9$exports as default};
//# sourceMappingURL=en-US.module.js.map
