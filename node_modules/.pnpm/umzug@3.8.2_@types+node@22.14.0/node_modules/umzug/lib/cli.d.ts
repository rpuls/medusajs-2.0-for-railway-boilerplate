import * as cli from '@rushstack/ts-command-line';
import type { Umzug } from './umzug';
export declare class UpAction extends cli.CommandLineAction {
    protected umzug: Umzug;
    private _params;
    constructor(umzug: Umzug);
    private static _defineParameters;
    onDefineParameters(): void;
    onExecute(): Promise<void>;
}
export declare class DownAction extends cli.CommandLineAction {
    protected umzug: Umzug;
    private _params;
    constructor(umzug: Umzug);
    private static _defineParameters;
    onDefineParameters(): void;
    onExecute(): Promise<void>;
}
export declare class ListAction extends cli.CommandLineAction {
    private readonly action;
    private readonly umzug;
    private _params;
    constructor(action: 'pending' | 'executed', umzug: Umzug);
    private static _defineParameters;
    onDefineParameters(): void;
    onExecute(): Promise<void>;
}
export declare class CreateAction extends cli.CommandLineAction {
    readonly umzug: Umzug;
    private _params;
    constructor(umzug: Umzug);
    private static _defineParameters;
    onDefineParameters(): void;
    onExecute(): Promise<void>;
}
export type CommandLineParserOptions = {
    toolFileName?: string;
    toolDescription?: string;
};
export declare class UmzugCLI extends cli.CommandLineParser {
    readonly umzug: Umzug;
    constructor(umzug: Umzug, commandLineParserOptions?: CommandLineParserOptions);
    onDefineParameters(): void;
}
