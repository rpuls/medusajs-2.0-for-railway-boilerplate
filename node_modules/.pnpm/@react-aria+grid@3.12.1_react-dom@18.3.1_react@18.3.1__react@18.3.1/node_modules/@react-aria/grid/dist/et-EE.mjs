var $5cbb62c8a19173ac$exports = {};
$5cbb62c8a19173ac$exports = {
    "deselectedItem": (args)=>`${args.item} pole valitud.`,
    "longPressToSelect": `Valikure\u{17E}iimi sisenemiseks vajutage pikalt.`,
    "select": `Vali`,
    "selectedAll": `K\xf5ik \xfcksused valitud.`,
    "selectedCount": (args, formatter)=>`${formatter.plural(args.count, {
            "=0": `\xdcksusi pole valitud`,
            one: ()=>`${formatter.number(args.count)} \xfcksus valitud`,
            other: ()=>`${formatter.number(args.count)} \xfcksust valitud`
        })}.`,
    "selectedItem": (args)=>`${args.item} valitud.`
};


export {$5cbb62c8a19173ac$exports as default};
//# sourceMappingURL=et-EE.module.js.map
