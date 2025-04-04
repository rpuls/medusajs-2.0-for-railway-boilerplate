var $fe136bcbacfcfa14$exports = {};
$fe136bcbacfcfa14$exports = {
    "close": `Chiudi`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} notifica`,
            other: ()=>`${formatter.number(args.count)} notifiche`
        })}.`
};


export {$fe136bcbacfcfa14$exports as default};
//# sourceMappingURL=it-IT.module.js.map
