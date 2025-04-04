var $888756784d832bd7$exports = {};
$888756784d832bd7$exports = {
    "close": `Fermer`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} notification`,
            other: ()=>`${formatter.number(args.count)} notifications`
        })}.`
};


export {$888756784d832bd7$exports as default};
//# sourceMappingURL=fr-FR.module.js.map
