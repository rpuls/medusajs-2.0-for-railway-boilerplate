"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearCacheCommand = void 0;
const core_1 = require("@mikro-orm/core");
const CLIHelper_1 = require("../CLIHelper");
class ClearCacheCommand {
    command = 'cache:clear';
    describe = 'Clear metadata cache';
    /**
     * @inheritDoc
     */
    async handler(args) {
        const config = await CLIHelper_1.CLIHelper.getConfiguration(args.contextName, args.config);
        if (!config.get('metadataCache').enabled) {
            CLIHelper_1.CLIHelper.dump(core_1.colors.red('Metadata cache is disabled in your configuration. Set cache.enabled to true to use this command.'));
            return;
        }
        const cache = config.getMetadataCacheAdapter();
        await cache.clear();
        CLIHelper_1.CLIHelper.dump(core_1.colors.green('Metadata cache was successfully cleared'));
    }
}
exports.ClearCacheCommand = ClearCacheCommand;
