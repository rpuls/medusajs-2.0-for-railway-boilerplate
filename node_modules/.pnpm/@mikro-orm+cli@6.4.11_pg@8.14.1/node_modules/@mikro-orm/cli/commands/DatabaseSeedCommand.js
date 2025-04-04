"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSeedCommand = void 0;
const core_1 = require("@mikro-orm/core");
const CLIHelper_1 = require("../CLIHelper");
class DatabaseSeedCommand {
    command = 'seeder:run';
    describe = 'Seed the database using the seeder class';
    builder = (args) => {
        args.option('c', {
            alias: 'class',
            type: 'string',
            desc: 'Seeder class to run',
        });
        return args;
    };
    /**
     * @inheritDoc
     */
    async handler(args) {
        const orm = await CLIHelper_1.CLIHelper.getORM(args.contextName, args.config);
        const className = args.class ?? orm.config.get('seeder').defaultSeeder;
        await orm.getSeeder().seedString(className);
        CLIHelper_1.CLIHelper.dump(core_1.colors.green(`Seeder ${className} successfully executed`));
        await orm.close(true);
    }
}
exports.DatabaseSeedCommand = DatabaseSeedCommand;
