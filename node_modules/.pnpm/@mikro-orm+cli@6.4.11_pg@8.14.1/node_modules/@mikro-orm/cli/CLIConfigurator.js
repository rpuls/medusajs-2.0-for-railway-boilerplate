"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIConfigurator = void 0;
const core_1 = require("@mikro-orm/core");
const yargs_1 = __importDefault(require("yargs"));
const ClearCacheCommand_1 = require("./commands/ClearCacheCommand");
const CreateDatabaseCommand_1 = require("./commands/CreateDatabaseCommand");
const CreateSeederCommand_1 = require("./commands/CreateSeederCommand");
const DatabaseSeedCommand_1 = require("./commands/DatabaseSeedCommand");
const DebugCommand_1 = require("./commands/DebugCommand");
const GenerateCacheCommand_1 = require("./commands/GenerateCacheCommand");
const GenerateEntitiesCommand_1 = require("./commands/GenerateEntitiesCommand");
const ImportCommand_1 = require("./commands/ImportCommand");
const MigrationCommandFactory_1 = require("./commands/MigrationCommandFactory");
const SchemaCommandFactory_1 = require("./commands/SchemaCommandFactory");
/**
 * @internal
 */
class CLIConfigurator {
    static createBasicConfig() {
        return yargs_1.default
            .scriptName('mikro-orm')
            .usage('Usage: $0 <command> [options]')
            .example('$0 schema:update --run', 'Runs schema synchronization')
            .option('config', {
            type: 'string',
            array: true,
            desc: `Set path to the ORM configuration file`,
        })
            .option('contextName', {
            alias: 'context',
            type: 'string',
            desc: 'Set name of config to load out of the ORM configuration file. Used when config file exports an array or a function',
            default: process.env.MIKRO_ORM_CONTEXT_NAME ?? 'default',
        })
            .alias('v', 'version')
            .alias('h', 'help')
            .recommendCommands()
            .strict();
    }
    static configure() {
        core_1.ConfigurationLoader.checkPackageVersion();
        const settings = core_1.ConfigurationLoader.getSettings();
        const version = core_1.Utils.getORMVersion();
        if (settings.useTsNode !== false) {
            const preferTs = core_1.ConfigurationLoader.registerTsNode(settings.tsConfigPath);
            /* istanbul ignore if */
            if (!preferTs) {
                process.env.MIKRO_ORM_CLI_USE_TS_NODE ??= '0';
            }
        }
        return CLIConfigurator.createBasicConfig()
            .version(version)
            .command(new ClearCacheCommand_1.ClearCacheCommand())
            .command(new GenerateCacheCommand_1.GenerateCacheCommand())
            .command(new GenerateEntitiesCommand_1.GenerateEntitiesCommand())
            .command(new CreateDatabaseCommand_1.CreateDatabaseCommand())
            .command(new ImportCommand_1.ImportCommand())
            .command(new DatabaseSeedCommand_1.DatabaseSeedCommand())
            .command(new CreateSeederCommand_1.CreateSeederCommand())
            .command(SchemaCommandFactory_1.SchemaCommandFactory.create('create'))
            .command(SchemaCommandFactory_1.SchemaCommandFactory.create('drop'))
            .command(SchemaCommandFactory_1.SchemaCommandFactory.create('update'))
            .command(SchemaCommandFactory_1.SchemaCommandFactory.create('fresh'))
            .command(MigrationCommandFactory_1.MigrationCommandFactory.create('create'))
            .command(MigrationCommandFactory_1.MigrationCommandFactory.create('up'))
            .command(MigrationCommandFactory_1.MigrationCommandFactory.create('down'))
            .command(MigrationCommandFactory_1.MigrationCommandFactory.create('list'))
            .command(MigrationCommandFactory_1.MigrationCommandFactory.create('check'))
            .command(MigrationCommandFactory_1.MigrationCommandFactory.create('pending'))
            .command(MigrationCommandFactory_1.MigrationCommandFactory.create('fresh'))
            .command(new DebugCommand_1.DebugCommand());
    }
}
exports.CLIConfigurator = CLIConfigurator;
