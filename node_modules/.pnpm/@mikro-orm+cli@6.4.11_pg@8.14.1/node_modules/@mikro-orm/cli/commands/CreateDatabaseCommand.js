"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDatabaseCommand = void 0;
const CLIHelper_1 = require("../CLIHelper");
class CreateDatabaseCommand {
    command = 'database:create';
    describe = 'Create your database if it does not exist';
    /**
     * @inheritDoc
     */
    async handler(args) {
        const orm = await CLIHelper_1.CLIHelper.getORM(args.contextName, args.config);
        const schemaGenerator = orm.getSchemaGenerator();
        await schemaGenerator.ensureDatabase();
        await orm.close(true);
    }
}
exports.CreateDatabaseCommand = CreateDatabaseCommand;
