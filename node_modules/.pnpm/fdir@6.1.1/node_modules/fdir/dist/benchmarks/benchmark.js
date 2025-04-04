"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const fdir5_1 = require("fdir5");
const fdir4_1 = require("fdir4");
const fdir3_1 = __importDefault(require("fdir3"));
const fdir1_1 = __importDefault(require("fdir1"));
const fdir2_1 = __importDefault(require("fdir2"));
const all_files_in_tree_1 = __importDefault(require("all-files-in-tree"));
const fs_readdir_recursive_1 = __importDefault(require("fs-readdir-recursive"));
const klaw_sync_1 = __importDefault(require("klaw-sync"));
const recurReadDir = __importStar(require("recur-readdir"));
const recursive_files_1 = __importDefault(require("recursive-files"));
const recursive_readdir_1 = __importDefault(require("recursive-readdir"));
const walk_sync_1 = __importDefault(require("walk-sync"));
const recursive_fs_1 = __importDefault(require("recursive-fs"));
const benny_1 = __importDefault(require("benny"));
const get_all_files_1 = require("get-all-files");
const package_json_1 = __importDefault(require("../package.json"));
const fs_1 = require("fs");
const csv_to_markdown_table_1 = __importDefault(require("csv-to-markdown-table"));
const export_1 = require("./export");
async function benchmark() {
    const counts = new index_1.fdir().onlyCounts().crawl("node_modules").sync();
    await benny_1.default.suite(`Synchronous (${counts.files} files, ${counts.directories} folders)`, benny_1.default.add(`fdir (v${package_json_1.default.version})`, () => {
        new index_1.fdir().crawl("node_modules").sync();
    }), benny_1.default.add("fdir (v1.2.0)", () => {
        fdir1_1.default.sync("node_modules");
    }), benny_1.default.add("fdir (v2.1.1)", () => {
        fdir2_1.default.sync("node_modules");
    }), benny_1.default.add("fdir (v3.4.2)", () => {
        new fdir3_1.default().crawl("node_modules").sync("node_modules");
    }), benny_1.default.add(`fdir (v4.1.0)`, () => {
        new fdir4_1.fdir().crawl("node_modules").sync();
    }), benny_1.default.add(`fdir (v5.0.0)`, () => {
        new fdir5_1.fdir().crawl("node_modules").sync();
    }), benny_1.default.add(`get-all-files`, () => {
        (0, get_all_files_1.getAllFilesSync)("node_modules").toArray();
    }), benny_1.default.add("all-files-in-tree", () => {
        all_files_in_tree_1.default.sync("node_modules");
    }), benny_1.default.add("fs-readdir-recursive", () => {
        (0, fs_readdir_recursive_1.default)("node_modules");
    }), benny_1.default.add("klaw-sync", () => {
        (0, klaw_sync_1.default)("node_modules", {});
    }), benny_1.default.add("recur-readdir", () => {
        recurReadDir.crawlSync("node_modules");
    }), benny_1.default.add("walk-sync", () => {
        (0, walk_sync_1.default)("node_modules");
    }), benny_1.default.cycle(), benny_1.default.complete(), benny_1.default.save({ format: "csv", file: "sync" }));
    await benny_1.default.suite(`Asynchronous (${counts.files} files, ${counts.directories} folders)`, benny_1.default.add(`fdir (v${package_json_1.default.version})`, async () => {
        await new index_1.fdir().crawl("node_modules").withPromise();
    }), benny_1.default.add(`fdir (v3.4.2)`, async () => {
        await new fdir3_1.default().crawl("node_modules").withPromise();
    }), benny_1.default.add(`fdir (v4.1.0)`, async () => {
        await new fdir4_1.fdir().crawl("node_modules").withPromise();
    }), benny_1.default.add(`fdir (v5.0.0)`, async () => {
        await new fdir5_1.fdir().crawl("node_modules").withPromise();
    }), benny_1.default.add("recursive-fs", async () => {
        await new Promise((resolve) => {
            recursive_fs_1.default.readdirr("node_modules", () => {
                resolve(undefined);
            });
        });
    }), benny_1.default.add("recur-readdir", async () => {
        await recurReadDir.crawl("node_modules");
    }), benny_1.default.add("recursive-files", async () => {
        let timeout;
        await new Promise((resolve) => {
            (0, recursive_files_1.default)("node_modules", { hidden: true }, () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    resolve(undefined);
                }, 0);
            });
        });
    }), benny_1.default.add("recursive-readdir", async () => {
        await (0, recursive_readdir_1.default)("node_modules");
    }), benny_1.default.add("getAllFiles", async () => {
        await (0, get_all_files_1.getAllFiles)("node_modules").toArray();
    }), benny_1.default.cycle(), benny_1.default.complete(), benny_1.default.save({ format: "csv", file: "./async" }));
    const asyncCsv = (0, fs_1.readFileSync)("./benchmark/results/async.csv", "utf-8");
    const syncCsv = (0, fs_1.readFileSync)("./benchmark/results/sync.csv", "utf-8");
    const md = `# Benchmarks

**System information:**
\`\`\`
Package version: ${package_json_1.default.version}
${await (0, export_1.getSystemInfo)()}
\`\`\`

## Asynchronous

> ${counts.files} files & ${counts.directories} directories

${toMd(asyncCsv, ",", true)}

## Synchronous

> ${counts.files} files & ${counts.directories} directories

${toMd(syncCsv, ",", true)}
`;
    (0, fs_1.writeFileSync)("BENCHMARKS.md", md);
}
benchmark();
function toMd(csv) {
    return (0, csv_to_markdown_table_1.default)(csv, ",", true)
        .replace(`"name"`, "Package")
        .replace(`"ops"`, `ops/s`)
        .replace(`"margin"`, "Error margin")
        .replace(`"percentSlower"`, "% slower")
        .replace(/"(.+?)"/gm, "$1");
}
