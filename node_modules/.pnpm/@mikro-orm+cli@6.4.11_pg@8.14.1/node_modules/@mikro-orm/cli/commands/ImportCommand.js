"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportCommand = void 0;
const core_1 = require("@mikro-orm/core");
const CLIHelper_1 = require("../CLIHelper");
class ImportCommand {
    command = 'database:import <file>';
    describe = 'Imports the SQL file to the database';
    /**
     * @inheritDoc
     */
    async handler(args) {
        const orm = await CLIHelper_1.CLIHelper.getORM(args.contextName, args.config, { multipleStatements: true });
        await orm.em.getConnection().loadFile(args.file);
        CLIHelper_1.CLIHelper.dump(core_1.colors.green(`File ${args.file} successfully imported`));
        await orm.close(true);
    }
}
exports.ImportCommand = ImportCommand;
