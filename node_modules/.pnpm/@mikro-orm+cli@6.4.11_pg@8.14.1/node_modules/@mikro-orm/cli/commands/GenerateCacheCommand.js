"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateCacheCommand = void 0;
const core_1 = require("@mikro-orm/core");
const CLIHelper_1 = require("../CLIHelper");
class GenerateCacheCommand {
    command = 'cache:generate';
    describe = 'Generate metadata cache';
    builder = (args) => {
        args.option('ts-node', {
            alias: 'ts',
            type: 'boolean',
            desc: `Use ts-node to generate '.ts' cache`,
        });
        args.option('combined', {
            alias: 'c',
            desc: `Generate production cache into a single JSON file that can be used with the GeneratedCacheAdapter.`,
        });
        return args;
    };
    /**
     * @inheritDoc
     */
    async handler(args) {
        const options = args.combined ? { combined: './metadata.json' } : {};
        const config = await CLIHelper_1.CLIHelper.getConfiguration(args.contextName, args.config, {
            metadataCache: { enabled: true, adapter: core_1.FileCacheAdapter, options },
        });
        await config.getMetadataCacheAdapter().clear();
        config.set('logger', CLIHelper_1.CLIHelper.dump.bind(null));
        config.set('debug', true);
        const discovery = new core_1.MetadataDiscovery(core_1.MetadataStorage.init(), config.getDriver().getPlatform(), config);
        await discovery.discover(args.ts ?? false);
        const combined = args.combined && config.get('metadataCache').combined;
        CLIHelper_1.CLIHelper.dump(core_1.colors.green(`${combined ? 'Combined ' : ''}${args.ts ? 'TS' : 'JS'} metadata cache was successfully generated${combined ? ' to ' + combined : ''}`));
    }
}
exports.GenerateCacheCommand = GenerateCacheCommand;
