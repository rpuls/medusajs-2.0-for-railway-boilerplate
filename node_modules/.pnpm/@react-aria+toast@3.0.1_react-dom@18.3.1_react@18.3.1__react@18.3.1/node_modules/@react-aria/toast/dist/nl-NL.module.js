var $949061cb954e8000$exports = {};
$949061cb954e8000$exports = {
    "close": `Sluiten`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} melding`,
            other: ()=>`${formatter.number(args.count)} meldingen`
        })}.`
};


export {$949061cb954e8000$exports as default};
//# sourceMappingURL=nl-NL.module.js.map
