"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaCommandFactory = void 0;
const core_1 = require("@mikro-orm/core");
const CLIHelper_1 = require("../CLIHelper");
class SchemaCommandFactory {
    static DESCRIPTIONS = {
        create: 'Create database schema based on current metadata',
        update: 'Update database schema based on current metadata',
        drop: 'Drop database schema based on current metadata',
        fresh: 'Drop and recreate database schema based on current metadata',
    };
    static SUCCESS_MESSAGES = {
        create: 'Schema successfully created',
        update: 'Schema successfully updated',
        drop: 'Schema successfully dropped',
        fresh: 'Schema successfully dropped and recreated',
    };
    static create(command) {
        const successMessage = SchemaCommandFactory.SUCCESS_MESSAGES[command];
        return {
            command: `schema:${command}`,
            describe: SchemaCommandFactory.DESCRIPTIONS[command],
            builder: (args) => SchemaCommandFactory.configureSchemaCommand(args, command),
            handler: (args) => SchemaCommandFactory.handleSchemaCommand(args, command, successMessage),
        };
    }
    static configureSchemaCommand(args, command) {
        args.option('r', {
            alias: 'run',
            type: 'boolean',
            desc: 'Runs queries',
        });
        if (command !== 'fresh') {
            args.option('d', {
                alias: 'dump',
                type: 'boolean',
                desc: 'Dumps all queries to console',
            });
            args.option('fk-checks', {
                type: 'boolean',
                desc: 'Do not skip foreign key checks',
            });
        }
        args.option('schema', {
            type: 'string',
            desc: 'Set the current schema for wildcard schema entities',
        });
        if (['create', 'fresh'].includes(command)) {
            args.option('seed', {
                type: 'string',
                desc: 'Allows to seed the database on create or drop and recreate',
            });
        }
        if (command === 'update') {
            args.option('safe', {
                type: 'boolean',
                desc: 'Allows to disable table and column dropping',
                default: false,
            });
            args.option('drop-tables', {
                type: 'boolean',
                desc: 'Allows to disable table dropping',
                default: true,
            });
        }
        if (command === 'drop') {
            args.option('drop-migrations-table', {
                type: 'boolean',
                desc: 'Drop also migrations table',
            });
        }
        if (['drop', 'fresh'].includes(command)) {
            args.option('drop-db', {
                type: 'boolean',
                desc: 'Drop the whole database',
            });
        }
        return args;
    }
    static async handleSchemaCommand(args, method, successMessage) {
        if (!args.run && !args.dump) {
            return CLIHelper_1.CLIHelper.showHelp();
        }
        const orm = await CLIHelper_1.CLIHelper.getORM(args.contextName, args.config);
        const generator = orm.getSchemaGenerator();
        const params = { wrap: args.fkChecks == null ? undefined : !args.fkChecks, ...args };
        if (args.dump) {
            const m = `get${method.substr(0, 1).toUpperCase()}${method.substr(1)}SchemaSQL`;
            const dump = await generator[m](params);
            /* istanbul ignore next */
            if (dump) {
                CLIHelper_1.CLIHelper.dump(dump, orm.config);
                successMessage = '';
            }
            else {
                successMessage = 'Schema is up-to-date';
            }
        }
        else if (method === 'fresh') {
            await generator.dropSchema(params);
            await generator.createSchema(params);
        }
        else {
            const m = method + 'Schema';
            await generator[m](params);
        }
        if (typeof args.seed !== 'undefined') {
            const seeder = orm.getSeeder();
            await seeder.seedString(args.seed || orm.config.get('seeder').defaultSeeder);
        }
        CLIHelper_1.CLIHelper.dump(core_1.colors.green(successMessage));
        await orm.close(true);
    }
}
exports.SchemaCommandFactory = SchemaCommandFactory;
