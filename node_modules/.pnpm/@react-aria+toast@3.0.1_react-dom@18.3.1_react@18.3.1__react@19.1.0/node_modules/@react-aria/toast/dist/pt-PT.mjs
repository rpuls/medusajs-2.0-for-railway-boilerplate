var $034c7393857c8db0$exports = {};
$034c7393857c8db0$exports = {
    "close": `Fechar`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} notifica\xe7\xe3o`,
            other: ()=>`${formatter.number(args.count)} notifica\xe7\xf5es`
        })}.`
};


export {$034c7393857c8db0$exports as default};
//# sourceMappingURL=pt-PT.module.js.map
