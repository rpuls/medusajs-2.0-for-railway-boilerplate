"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSeederCommand = void 0;
const core_1 = require("@mikro-orm/core");
const CLIHelper_1 = require("../CLIHelper");
class CreateSeederCommand {
    command = 'seeder:create <seeder>';
    describe = 'Create a new seeder class';
    builder = (args) => {
        args.positional('seeder', {
            describe: 'Name for the seeder class. (e.g. "test" will generate "TestSeeder" or "TestSeeder" will generate "TestSeeder")',
            demandOption: true,
        });
        return args;
    };
    /**
     * @inheritDoc
     */
    async handler(args) {
        const className = CreateSeederCommand.getSeederClassName(args.seeder);
        const orm = await CLIHelper_1.CLIHelper.getORM(args.contextName, args.config);
        const seeder = orm.getSeeder();
        const path = await seeder.createSeeder(className);
        CLIHelper_1.CLIHelper.dump(core_1.colors.green(`Seeder ${args.seeder} successfully created at ${path}`));
        await orm.close(true);
    }
    /**
     * Will return a seeder name that is formatted like this EntitySeeder
     */
    static getSeederClassName(name) {
        name = name.match(/(.+)seeder/i)?.[1] ?? name;
        const parts = name.split('-');
        return parts.map(name => name.charAt(0).toUpperCase() + name.slice(1)).join('') + 'Seeder';
    }
}
exports.CreateSeederCommand = CreateSeederCommand;
