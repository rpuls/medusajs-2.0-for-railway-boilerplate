"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIHelper = void 0;
const fs_extra_1 = require("fs-extra");
const yargs_1 = __importDefault(require("yargs"));
const core_1 = require("@mikro-orm/core");
/**
 * @internal
 */
class CLIHelper {
    static async getConfiguration(contextName, configPaths, options = {}) {
        const deps = core_1.ConfigurationLoader.getORMPackages();
        if (!deps.has('@mikro-orm/cli') && !process.env.MIKRO_ORM_ALLOW_GLOBAL_CLI) {
            throw new Error('@mikro-orm/cli needs to be installed as a local dependency!');
        }
        core_1.ConfigurationLoader.commonJSCompat(options);
        core_1.ConfigurationLoader.registerDotenv(options);
        configPaths ??= core_1.ConfigurationLoader.getConfigPaths();
        contextName ??= process.env.MIKRO_ORM_CONTEXT_NAME ?? 'default';
        return core_1.ConfigurationLoader.getConfiguration(contextName, configPaths, options);
    }
    static async getORM(contextName, configPaths, opts = {}) {
        const options = await CLIHelper.getConfiguration(contextName, configPaths, opts);
        const settings = core_1.ConfigurationLoader.getSettings();
        options.set('allowGlobalContext', true);
        options.set('debug', !!settings.verbose);
        options.getLogger().setDebugMode(!!settings.verbose);
        options.set('connect', false);
        if (settings.useTsNode !== false) {
            options.set('preferTs', true);
        }
        // The only times when we don't care to have a warning about no entities is also the time when we ignore entities.
        if (opts.discovery?.warnWhenNoEntities === false) {
            options.set('entities', []);
            options.set('entitiesTs', []);
        }
        return core_1.MikroORM.init(options.getAll());
    }
    static async isDBConnected(config, reason = false) {
        try {
            await config.getDriver().connect();
            const isConnected = await config.getDriver().getConnection().checkConnection();
            await config.getDriver().close();
            return isConnected.ok || (reason ? isConnected.reason : false);
        }
        catch {
            return false;
        }
    }
    static getNodeVersion() {
        return process.versions.node;
    }
    static getDriverDependencies(config) {
        try {
            return config.getDriver().getDependencies();
        }
        catch {
            return [];
        }
    }
    static dump(text, config) {
        if (config?.get('highlighter')) {
            text = config.get('highlighter').highlight(text);
        }
        // eslint-disable-next-line no-console
        console.log(text);
    }
    static getConfigPaths() {
        return core_1.ConfigurationLoader.getConfigPaths();
    }
    static async dumpDependencies() {
        const version = core_1.Utils.getORMVersion();
        CLIHelper.dump(' - dependencies:');
        CLIHelper.dump(`   - mikro-orm ${core_1.colors.green(version)}`);
        CLIHelper.dump(`   - node ${core_1.colors.green(CLIHelper.getNodeVersion())}`);
        if ((0, fs_extra_1.pathExistsSync)(process.cwd() + '/package.json')) {
            /* istanbul ignore next */
            if (process.versions.bun) {
                CLIHelper.dump(`   - typescript via bun`);
            }
            else {
                CLIHelper.dump(`   - typescript ${await CLIHelper.getModuleVersion('typescript')}`);
            }
            CLIHelper.dump(' - package.json ' + core_1.colors.green('found'));
        }
        else {
            CLIHelper.dump(' - package.json ' + core_1.colors.red('not found'));
        }
    }
    static async getModuleVersion(name) {
        try {
            const pkg = core_1.Utils.requireFrom(`${name}/package.json`);
            return core_1.colors.green(pkg.version);
        }
        catch {
            return core_1.colors.red('not-found');
        }
    }
    static dumpTable(options) {
        if (options.rows.length === 0) {
            return CLIHelper.dump(options.empty);
        }
        const data = [options.columns, ...options.rows];
        const lengths = options.columns.map(() => 0);
        data.forEach(row => {
            row.forEach((cell, idx) => {
                lengths[idx] = Math.max(lengths[idx], cell.length + 2);
            });
        });
        let ret = '';
        ret += core_1.colors.grey('┌' + lengths.map(length => '─'.repeat(length)).join('┬') + '┐\n');
        ret += core_1.colors.grey('│') + lengths.map((length, idx) => ' ' + core_1.colors.red(options.columns[idx]) + ' '.repeat(length - options.columns[idx].length - 1)).join(core_1.colors.grey('│')) + core_1.colors.grey('│\n');
        ret += core_1.colors.grey('├' + lengths.map(length => '─'.repeat(length)).join('┼') + '┤\n');
        options.rows.forEach(row => {
            ret += core_1.colors.grey('│') + lengths.map((length, idx) => ' ' + row[idx] + ' '.repeat(length - row[idx].length - 1)).join(core_1.colors.grey('│')) + core_1.colors.grey('│\n');
        });
        ret += core_1.colors.grey('└' + lengths.map(length => '─'.repeat(length)).join('┴') + '┘');
        CLIHelper.dump(ret);
    }
    /* istanbul ignore next */
    static showHelp() {
        yargs_1.default.showHelp();
    }
}
exports.CLIHelper = CLIHelper;
