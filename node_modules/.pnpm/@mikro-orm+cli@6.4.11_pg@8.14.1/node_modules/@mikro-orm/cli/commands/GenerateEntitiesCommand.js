"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateEntitiesCommand = void 0;
const CLIHelper_1 = require("../CLIHelper");
class GenerateEntitiesCommand {
    command = 'generate-entities';
    describe = 'Generate entities based on current database schema';
    /**
     * @inheritDoc
     */
    builder(args) {
        args.option('s', {
            alias: 'save',
            type: 'boolean',
            desc: 'Saves entities to directory defined by --path',
        });
        args.option('d', {
            alias: 'dump',
            type: 'boolean',
            desc: 'Dumps all entities to console',
        });
        args.option('p', {
            alias: 'path',
            type: 'string',
            desc: 'Sets path to directory where to save entities',
        });
        args.option('schema', {
            type: 'string',
            desc: 'Generates entities only for given schema',
        });
        return args;
    }
    /**
     * @inheritDoc
     */
    async handler(args) {
        if (!args.save && !args.dump) {
            return CLIHelper_1.CLIHelper.showHelp();
        }
        const orm = await CLIHelper_1.CLIHelper.getORM(args.contextName, args.config, { discovery: { warnWhenNoEntities: false } });
        const dump = await orm.entityGenerator.generate({
            save: args.save,
            path: args.path,
            schema: args.schema,
        });
        if (args.dump) {
            CLIHelper_1.CLIHelper.dump(dump.join('\n\n'));
        }
        await orm.close(true);
    }
}
exports.GenerateEntitiesCommand = GenerateEntitiesCommand;
