var $a361756a93b6e28c$exports = {};
$a361756a93b6e28c$exports = {
    "close": `Fechar`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} notifica\xe7\xe3o`,
            other: ()=>`${formatter.number(args.count)} notifica\xe7\xf5es`
        })}.`
};


export {$a361756a93b6e28c$exports as default};
//# sourceMappingURL=pt-BR.module.js.map
