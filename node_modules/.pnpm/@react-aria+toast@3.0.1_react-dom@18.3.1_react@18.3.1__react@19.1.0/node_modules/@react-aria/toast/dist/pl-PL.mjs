var $8189bed27add1ad3$exports = {};
$8189bed27add1ad3$exports = {
    "close": `Zamknij`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} powiadomienie`,
            few: ()=>`${formatter.number(args.count)} powiadomienia`,
            many: ()=>`${formatter.number(args.count)} powiadomie\u{144}`,
            other: ()=>`${formatter.number(args.count)} powiadomienia`
        })}.`
};


export {$8189bed27add1ad3$exports as default};
//# sourceMappingURL=pl-PL.module.js.map
