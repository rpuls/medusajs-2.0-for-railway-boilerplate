var $e4b9aef18b0db8dc$exports = {};
$e4b9aef18b0db8dc$exports = {
    "close": `Sulje`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} ilmoitus`,
            other: ()=>`${formatter.number(args.count)} ilmoitusta`
        })}.`
};


export {$e4b9aef18b0db8dc$exports as default};
//# sourceMappingURL=fi-FI.module.js.map
