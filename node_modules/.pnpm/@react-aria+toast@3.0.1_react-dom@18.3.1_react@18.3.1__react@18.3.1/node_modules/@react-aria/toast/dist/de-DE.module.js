var $7063c2d0f14f979a$exports = {};
$7063c2d0f14f979a$exports = {
    "close": `Schlie\xdfen`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} Benachrichtigung`,
            other: ()=>`${formatter.number(args.count)} Benachrichtigungen`
        })}.`
};


export {$7063c2d0f14f979a$exports as default};
//# sourceMappingURL=de-DE.module.js.map
