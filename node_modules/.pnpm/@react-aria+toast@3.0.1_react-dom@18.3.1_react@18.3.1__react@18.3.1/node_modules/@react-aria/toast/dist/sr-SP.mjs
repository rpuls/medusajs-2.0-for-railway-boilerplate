var $7dbdd7289c10d2ba$exports = {};
$7dbdd7289c10d2ba$exports = {
    "close": `Zatvori`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} obave\u{161}tenje`,
            other: ()=>`${formatter.number(args.count)} obave\u{161}tenja`
        })}.`
};


export {$7dbdd7289c10d2ba$exports as default};
//# sourceMappingURL=sr-SP.module.js.map
