"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationCommandFactory = void 0;
const core_1 = require("@mikro-orm/core");
const CLIHelper_1 = require("../CLIHelper");
class MigrationCommandFactory {
    static DESCRIPTIONS = {
        create: 'Create new migration with current schema diff',
        up: 'Migrate up to the latest version',
        down: 'Migrate one step down',
        list: 'List all executed migrations',
        check: 'Check if migrations are needed. Useful for bash scripts.',
        pending: 'List all pending migrations',
        fresh: 'Clear the database and rerun all migrations',
    };
    static create(command) {
        return {
            command: `migration:${command}`,
            describe: MigrationCommandFactory.DESCRIPTIONS[command],
            builder: (args) => MigrationCommandFactory.configureMigrationCommand(args, command),
            handler: (args) => MigrationCommandFactory.handleMigrationCommand(args, command),
        };
    }
    static configureMigrationCommand(args, method) {
        if (method === 'create') {
            return this.configureCreateCommand(args);
        }
        if (method === 'up' || method === 'down') {
            return this.configureUpDownCommand(args, method);
        }
        if (method === 'fresh') {
            return this.configureFreshCommand(args);
        }
        return args;
    }
    static configureUpDownCommand(args, method) {
        args.option('t', {
            alias: 'to',
            type: 'string',
            desc: `Migrate ${method} to specific version`,
        });
        args.option('f', {
            alias: 'from',
            type: 'string',
            desc: 'Start migration from specific version',
        });
        args.option('o', {
            alias: 'only',
            type: 'string',
            desc: 'Migrate only specified versions',
        });
        return args;
    }
    static configureCreateCommand(args) {
        args.option('b', {
            alias: 'blank',
            type: 'boolean',
            desc: 'Create blank migration',
        });
        args.option('i', {
            alias: 'initial',
            type: 'boolean',
            desc: 'Create initial migration',
        });
        args.option('d', {
            alias: 'dump',
            type: 'boolean',
            desc: 'Dumps all queries to console',
        });
        args.option('p', {
            alias: 'path',
            type: 'string',
            desc: 'Sets path to directory where to save entities',
        });
        args.option('n', {
            alias: 'name',
            type: 'string',
            desc: 'Specify custom name for the file',
        });
        return args;
    }
    static async handleMigrationCommand(args, method) {
        // to be able to run have a master transaction, but run marked migrations outside of it, we need a second connection
        const options = { pool: { min: 1, max: 2 } };
        const orm = await CLIHelper_1.CLIHelper.getORM(args.contextName, args.config, options);
        const migrator = orm.getMigrator();
        switch (method) {
            case 'create':
                await this.handleCreateCommand(migrator, args, orm.config);
                break;
            case 'check':
                await this.handleCheckCommand(migrator, orm);
                break;
            case 'list':
                await this.handleListCommand(migrator);
                break;
            case 'pending':
                await this.handlePendingCommand(migrator);
                break;
            case 'up':
            case 'down':
                await this.handleUpDownCommand(args, migrator, method);
                break;
            case 'fresh':
                await this.handleFreshCommand(args, migrator, orm);
        }
        await orm.close(true);
    }
    static configureFreshCommand(args) {
        args.option('seed', {
            type: 'string',
            desc: 'Allows to seed the database after dropping it and rerunning all migrations',
        });
        args.option('drop-db', {
            type: 'boolean',
            desc: 'Drop the whole database',
        });
        return args;
    }
    static async handleUpDownCommand(args, migrator, method) {
        const opts = MigrationCommandFactory.getUpDownOptions(args);
        await migrator[method](opts);
        const message = this.getUpDownSuccessMessage(method, opts);
        CLIHelper_1.CLIHelper.dump(core_1.colors.green(message));
    }
    static async handlePendingCommand(migrator) {
        const pending = await migrator.getPendingMigrations();
        CLIHelper_1.CLIHelper.dumpTable({
            columns: ['Name'],
            rows: pending.map(row => [row.name]),
            empty: 'No pending migrations',
        });
    }
    static async handleListCommand(migrator) {
        const executed = await migrator.getExecutedMigrations();
        CLIHelper_1.CLIHelper.dumpTable({
            columns: ['Name', 'Executed at'],
            rows: executed.map(row => {
                /* istanbul ignore next */
                const executedAt = (row.executed_at ?? row.created_at)?.toISOString() ?? '';
                return [row.name.replace(/\.[jt]s$/, ''), executedAt];
            }),
            empty: 'No migrations executed yet',
        });
    }
    static async handleCreateCommand(migrator, args, config) {
        const ret = await migrator.createMigration(args.path, args.blank, args.initial, args.name);
        if (ret.diff.up.length === 0) {
            return CLIHelper_1.CLIHelper.dump(core_1.colors.green(`No changes required, schema is up-to-date`));
        }
        if (args.dump) {
            CLIHelper_1.CLIHelper.dump(core_1.colors.green('Creating migration with following queries:'));
            CLIHelper_1.CLIHelper.dump(core_1.colors.green('up:'));
            CLIHelper_1.CLIHelper.dump(ret.diff.up.map(sql => '  ' + sql).join('\n'), config);
            /* istanbul ignore next */
            if (config.getDriver().getPlatform().supportsDownMigrations()) {
                CLIHelper_1.CLIHelper.dump(core_1.colors.green('down:'));
                CLIHelper_1.CLIHelper.dump(ret.diff.down.map(sql => '  ' + sql).join('\n'), config);
            }
            else {
                CLIHelper_1.CLIHelper.dump(core_1.colors.yellow(`(${config.getDriver().constructor.name} does not support automatic down migrations)`));
            }
        }
        CLIHelper_1.CLIHelper.dump(core_1.colors.green(`${ret.fileName} successfully created`));
    }
    static async handleCheckCommand(migrator, orm) {
        if (!await migrator.checkMigrationNeeded()) {
            return CLIHelper_1.CLIHelper.dump(core_1.colors.green(`No changes required, schema is up-to-date`));
        }
        await orm.close(true);
        CLIHelper_1.CLIHelper.dump(core_1.colors.yellow(`Changes detected. Please create migration to update schema.`));
        process.exit(1);
    }
    static async handleFreshCommand(args, migrator, orm) {
        const generator = orm.getSchemaGenerator();
        await generator.dropSchema({ dropMigrationsTable: true, dropDb: args.dropDb });
        CLIHelper_1.CLIHelper.dump(core_1.colors.green('Dropped schema successfully'));
        const opts = MigrationCommandFactory.getUpDownOptions(args);
        await migrator.up(opts);
        const message = this.getUpDownSuccessMessage('up', opts);
        CLIHelper_1.CLIHelper.dump(core_1.colors.green(message));
        if (args.seed !== undefined) {
            const seeder = orm.getSeeder();
            const seederClass = args.seed || orm.config.get('seeder').defaultSeeder;
            await seeder.seedString(seederClass);
            CLIHelper_1.CLIHelper.dump(core_1.colors.green(`Database seeded successfully with seeder class ${seederClass}`));
        }
    }
    static getUpDownOptions(flags) {
        if (!flags.to && !flags.from && flags.only) {
            return { migrations: flags.only.split(/[, ]+/) };
        }
        const ret = {};
        ['from', 'to'].filter(k => flags[k]).forEach(k => ret[k] = flags[k] === '0' ? 0 : flags[k]);
        return ret;
    }
    static getUpDownSuccessMessage(method, options) {
        const msg = `Successfully migrated ${method}`;
        if (method === 'down' && core_1.Utils.isEmpty(options)) {
            return msg + ' to previous version';
        }
        if (options.to === 0) {
            const v = { down: 'first', up: 'latest' }[method];
            return `${msg} to the ${v} version`;
        }
        if (method === 'up' && core_1.Utils.isEmpty(options)) {
            return msg + ' to the latest version';
        }
        if (core_1.Utils.isString(options.to)) {
            return msg + ' to version ' + options.to;
        }
        if (options.migrations && options.migrations.length === 1) {
            return msg + ' to version ' + options.migrations[0];
        }
        return msg;
    }
}
exports.MigrationCommandFactory = MigrationCommandFactory;
