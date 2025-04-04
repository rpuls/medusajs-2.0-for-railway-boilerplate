var $e43d964a0c7f1266$exports = {};
$e43d964a0c7f1266$exports = {
    "close": `Zatvori\u{165}`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} ozn\xe1menie`,
            few: ()=>`${formatter.number(args.count)} ozn\xe1menia`,
            other: ()=>`${formatter.number(args.count)} ozn\xe1men\xed`
        })}.`
};


export {$e43d964a0c7f1266$exports as default};
//# sourceMappingURL=sk-SK.module.js.map
