/// <reference types="node" />
import { Output, OnlyCountsOutput, GroupOutput, PathsOutput, Options, FilterPredicate, ExcludePredicate } from "../types";
import { APIBuilder } from "./api-builder";
import type { PicomatchOptions } from "picomatch";
export declare class Builder<TReturnType extends Output = PathsOutput> {
    private readonly globCache;
    private options;
    constructor(options?: Partial<Options>);
    group(): Builder<GroupOutput>;
    withPathSeparator(separator: "/" | "\\"): this;
    withBasePath(): this;
    withRelativePaths(): this;
    withDirs(): this;
    withMaxDepth(depth: number): this;
    withMaxFiles(limit: number): this;
    withFullPaths(): this;
    withErrors(): this;
    withSymlinks(): this;
    withAbortSignal(signal: AbortSignal): this;
    normalize(): this;
    filter(predicate: FilterPredicate): this;
    onlyDirs(): this;
    exclude(predicate: ExcludePredicate): this;
    onlyCounts(): Builder<OnlyCountsOutput>;
    crawl(root: string): APIBuilder<TReturnType>;
    /**
     * @deprecated Pass options using the constructor instead:
     * ```ts
     * new fdir(options).crawl("/path/to/root");
     * ```
     * This method will be removed in v7.0
     */
    crawlWithOptions(root: string, options: Partial<Options>): APIBuilder<TReturnType>;
    glob(...patterns: string[]): this;
    globWithOptions(patterns: string[], options: PicomatchOptions): this;
}
