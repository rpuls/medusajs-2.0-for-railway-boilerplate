"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const glob_1 = require("glob");
const fast_glob_1 = __importDefault(require("fast-glob"));
const tiny_glob_1 = __importDefault(require("tiny-glob"));
const sync_1 = __importDefault(require("tiny-glob/sync"));
const benny_1 = __importDefault(require("benny"));
const package_json_1 = __importDefault(require("../package.json"));
async function benchmark() {
    const counts = new index_1.fdir().glob("**/*.js").onlyCounts().crawl(".").sync();
    await benny_1.default.suite(`Asynchronous (${counts.files} files, ${counts.directories} folders)`, benny_1.default.add(`fdir ${package_json_1.default.version} async`, async () => {
        await new index_1.fdir().glob("**/*.js").crawl(".").withPromise();
    }), benny_1.default.add("glob async", async () => {
        await (0, glob_1.glob)("**/*.js", { dot: true, withFileTypes: true });
    }), benny_1.default.add("fast-glob async", async () => {
        await (0, fast_glob_1.default)("**/*.js", { dot: true, onlyFiles: true });
    }), benny_1.default.add("tiny-glob async", async () => {
        await (0, tiny_glob_1.default)("**/*.js", { dot: true, filesOnly: true });
    }), benny_1.default.cycle(), benny_1.default.complete());
    await benny_1.default.suite(`Synchronous (${counts.files} files, ${counts.dirs} folders)`, benny_1.default.add(`fdir ${package_json_1.default.version} sync`, () => {
        new index_1.fdir().glob("**.js").crawl(".").sync();
    }), benny_1.default.add("glob sync", () => {
        (0, glob_1.globSync)("**/**.js", { dot: true, withFileTypes: true });
    }), benny_1.default.add("fast-glob sync", () => {
        fast_glob_1.default.sync("**.js", { dot: true });
    }), benny_1.default.add("tiny-glob sync", () => {
        (0, sync_1.default)("**/**.js", { dot: true });
    }), benny_1.default.cycle(), benny_1.default.complete());
}
benchmark();
