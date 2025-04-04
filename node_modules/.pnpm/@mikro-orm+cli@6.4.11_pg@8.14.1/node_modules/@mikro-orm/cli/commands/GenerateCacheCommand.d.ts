import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { BaseArgs, BaseCommand } from '../CLIConfigurator';
type CacheArgs = BaseArgs & {
    ts?: boolean;
    combined?: string;
};
export declare class GenerateCacheCommand implements BaseCommand<CacheArgs> {
    command: string;
    describe: string;
    builder: (args: Argv<BaseArgs>) => Argv<CacheArgs>;
    /**
     * @inheritDoc
     */
    handler(args: ArgumentsCamelCase<CacheArgs>): Promise<void>;
}
export {};
