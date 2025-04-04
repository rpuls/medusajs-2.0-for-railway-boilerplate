import yargs, { type CommandModule } from 'yargs';
/**
 * @internal
 */
export type BaseArgs = Awaited<ReturnType<typeof CLIConfigurator['createBasicConfig']>['argv']>;
/**
 * @internal
 */
export interface BaseCommand<CommandArgs extends BaseArgs = BaseArgs> extends CommandModule<BaseArgs, CommandArgs> {
}
/**
 * @internal
 */
export declare class CLIConfigurator {
    private static createBasicConfig;
    static configure(): yargs.Argv<{
        config: string[] | undefined;
    } & {
        contextName: string;
    }>;
}
