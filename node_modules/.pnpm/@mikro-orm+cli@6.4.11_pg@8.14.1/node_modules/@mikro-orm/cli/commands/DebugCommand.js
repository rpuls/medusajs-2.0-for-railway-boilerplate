"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugCommand = void 0;
const core_1 = require("@mikro-orm/core");
const CLIHelper_1 = require("../CLIHelper");
class DebugCommand {
    command = 'debug';
    describe = 'Debug CLI configuration';
    /**
     * @inheritDoc
     */
    async handler(args) {
        CLIHelper_1.CLIHelper.dump(`Current ${core_1.colors.cyan('MikroORM')} CLI configuration`);
        await CLIHelper_1.CLIHelper.dumpDependencies();
        const settings = core_1.ConfigurationLoader.getSettings();
        if (!process.versions.bun && settings.useTsNode !== false) {
            CLIHelper_1.CLIHelper.dump(' - ts-node ' + core_1.colors.green('enabled'));
        }
        const configPaths = args.config ?? CLIHelper_1.CLIHelper.getConfigPaths();
        CLIHelper_1.CLIHelper.dump(' - searched config paths:');
        await DebugCommand.checkPaths(configPaths, 'yellow');
        CLIHelper_1.CLIHelper.dump(` - searched for config name: ${core_1.colors.green(args.contextName)}`);
        try {
            const config = await CLIHelper_1.CLIHelper.getConfiguration(args.contextName, configPaths);
            CLIHelper_1.CLIHelper.dump(` - configuration ${core_1.colors.green('found')}`);
            const drivers = CLIHelper_1.CLIHelper.getDriverDependencies(config);
            CLIHelper_1.CLIHelper.dump(' - driver dependencies:');
            for (const driver of drivers) {
                CLIHelper_1.CLIHelper.dump(`   - ${driver} ${await CLIHelper_1.CLIHelper.getModuleVersion(driver)}`);
            }
            const isConnected = await CLIHelper_1.CLIHelper.isDBConnected(config, true);
            if (isConnected === true) {
                CLIHelper_1.CLIHelper.dump(` - ${core_1.colors.green('database connection successful')}`);
            }
            else {
                CLIHelper_1.CLIHelper.dump(` - ${core_1.colors.yellow(`database connection failed (${isConnected})`)}`);
            }
            const preferTs = config.get('preferTs');
            if ([true, false].includes(preferTs)) {
                const warning = preferTs ? ' (this value should be set to `false` when running compiled code!)' : '';
                CLIHelper_1.CLIHelper.dump(` - \`preferTs\` flag explicitly set to ${preferTs}, will use \`entities${preferTs ? 'Ts' : ''}\` array${warning}`);
            }
            const entities = config.get('entities', []);
            if (entities.length > 0) {
                const refs = entities.filter(p => !core_1.Utils.isString(p));
                const paths = entities.filter(p => core_1.Utils.isString(p));
                const will = !config.get('preferTs') ? 'will' : 'could';
                CLIHelper_1.CLIHelper.dump(` - ${will} use \`entities\` array (contains ${refs.length} references and ${paths.length} paths)`);
                if (paths.length > 0) {
                    await DebugCommand.checkPaths(paths, 'red', config.get('baseDir'));
                }
            }
            const entitiesTs = config.get('entitiesTs', []);
            if (entitiesTs.length > 0) {
                const refs = entitiesTs.filter(p => !core_1.Utils.isString(p));
                const paths = entitiesTs.filter(p => core_1.Utils.isString(p));
                /* istanbul ignore next */
                const will = config.get('preferTs') ? 'will' : 'could';
                CLIHelper_1.CLIHelper.dump(` - ${will} use \`entitiesTs\` array (contains ${refs.length} references and ${paths.length} paths)`);
                /* istanbul ignore else */
                if (paths.length > 0) {
                    await DebugCommand.checkPaths(paths, 'red', config.get('baseDir'));
                }
            }
        }
        catch (e) {
            CLIHelper_1.CLIHelper.dump(`- configuration ${core_1.colors.red('not found')} ${core_1.colors.red(`(${e.message})`)}`);
        }
    }
    static async checkPaths(paths, failedColor, baseDir) {
        for (let path of paths) {
            path = core_1.Utils.absolutePath(path, baseDir);
            path = core_1.Utils.normalizePath(path);
            const found = await core_1.Utils.pathExists(path);
            if (found) {
                CLIHelper_1.CLIHelper.dump(`   - ${path} (${core_1.colors.green('found')})`);
            }
            else {
                CLIHelper_1.CLIHelper.dump(`   - ${path} (${core_1.colors[failedColor]('not found')})`);
            }
        }
    }
}
exports.DebugCommand = DebugCommand;
