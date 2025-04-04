var $0bc56cee3275bcaa$exports = {};
$0bc56cee3275bcaa$exports = {
    "close": `Zapri`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} obvestilo`,
            two: ()=>`${formatter.number(args.count)} obvestili`,
            few: ()=>`${formatter.number(args.count)} obvestila`,
            other: ()=>`${formatter.number(args.count)} obvestil`
        })}.`
};


export {$0bc56cee3275bcaa$exports as default};
//# sourceMappingURL=sl-SI.module.js.map
