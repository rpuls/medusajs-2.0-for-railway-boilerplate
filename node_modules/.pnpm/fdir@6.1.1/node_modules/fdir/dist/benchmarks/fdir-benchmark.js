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
const child_process_1 = __importDefault(require("child_process"));
const benny_1 = __importDefault(require("benny"));
const versions = ["4.0.0", "4.1.0", "5.0.0", "5.2.0"];
const syncSuites = [];
const asyncSuites = [];
function normalizeVersion(version) {
    return version.replace(/\./g, "");
}
function makeSuite(version) {
    const normalized = normalizeVersion(version);
    const { fdir } = require(`fdir${normalized}`);
    addSuite(fdir, version);
}
function addSuite(instance, version) {
    syncSuites[syncSuites.length] = benny_1.default.add(`fdir ${version} sync`, function () {
        new instance().crawl("node_modules").sync();
    });
    asyncSuites[asyncSuites.length] = benny_1.default.add(`fdir ${version} async`, async function () {
        await new instance().crawl("node_modules").withPromise();
    });
}
async function fillSuites() {
    const { fdir } = await Promise.resolve().then(() => __importStar(require("../index")));
    addSuite(fdir, "current");
    versions.forEach((version) => {
        makeSuite(version);
    });
}
async function runBenchmark() {
    await fillSuites();
    const counts = await getCounts();
    await benny_1.default.suite(`Asynchronous (${counts.files} files, ${counts.dirs} folders)`, ...asyncSuites, benny_1.default.cycle(), benny_1.default.complete());
    await benny_1.default.suite(`Synchronous (${counts.files} files, ${counts.dirs} folders)`, ...syncSuites, benny_1.default.cycle(), benny_1.default.complete());
}
function getPackageAlias(version) {
    const normalized = normalizeVersion(version);
    return `fdir${normalized}@npm:fdir@${version}`;
}
async function getCounts() {
    var _a;
    const normalized = normalizeVersion(versions[3]);
    const { fdir } = await (_a = `fdir${normalized}`, Promise.resolve().then(() => __importStar(require(_a))));
    return new fdir().onlyCounts().crawl("node_modules").sync();
}
function appendVersionsToCommand(command) {
    versions.forEach((v) => {
        command += getPackageAlias(v) + " ";
    });
    return command.trim();
}
function removePackages() {
    const v = versions.map((v) => normalizeVersion(v)).join(" fdir");
    let cmd = `npm uninstall fdir${v}`;
    child_process_1.default.exec(cmd.trim(), (err) => {
        if (err) {
            console.error(err);
            process.exit(err.code);
        }
        console.log("Done removing all versions...");
    });
}
function addPackages() {
    let cmd = appendVersionsToCommand(`npm i -D `);
    console.log("Running cmd", cmd);
    child_process_1.default.exec(cmd.trim(), async (err) => {
        if (err) {
            console.error(err);
            process.exit(err.code);
        }
        console.log(`Done installing all versions...`);
        console.log("Starting benchmarks...");
        await setCPUScaling(false);
        await runBenchmark();
        await setCPUScaling(true);
        removePackages();
    });
}
function setCPUScaling(isEnabled) {
    if (process.platform !== "linux")
        return;
    return new Promise((resolve, reject) => {
        console.log((isEnabled ? "Enabling" : "Disabling") + " cpu scaling...");
        const profile = isEnabled ? "powersave" : "performance";
        child_process_1.default.exec(`sudo cpupower frequency-set --governor ${profile}`, (err) => {
            if (err)
                return reject(err);
            resolve(undefined);
        });
    });
}
addPackages();
