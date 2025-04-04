var $87ffcbc0b651e40b$exports = {};
$87ffcbc0b651e40b$exports = {
    "close": `Zatvori`,
    "notifications": (args, formatter)=>`${formatter.plural(args.count, {
            one: ()=>`${formatter.number(args.count)} obavijest`,
            other: ()=>`${formatter.number(args.count)} obavijesti`
        })}.`
};


export {$87ffcbc0b651e40b$exports as default};
//# sourceMappingURL=hr-HR.module.js.map
