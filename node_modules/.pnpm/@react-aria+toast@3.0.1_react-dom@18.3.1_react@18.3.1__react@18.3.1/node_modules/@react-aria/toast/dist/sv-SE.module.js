var $ccbe6066c10b1e53$exports = {};
$ccbe6066c10b1e53$exports = {
    "close": `St\xe4ng`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} meddelande`,
            other: ()=>`${formatter.number(args.count)} meddelanden`
        })}.`
};


export {$ccbe6066c10b1e53$exports as default};
//# sourceMappingURL=sv-SE.module.js.map
