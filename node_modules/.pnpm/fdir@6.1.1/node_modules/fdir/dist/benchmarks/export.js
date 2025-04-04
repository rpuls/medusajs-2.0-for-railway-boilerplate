"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemInfo = void 0;
const systeminformation_1 = __importDefault(require("systeminformation"));
async function getSystemInfo() {
    const cpu = await systeminformation_1.default.cpu();
    const disk = (await systeminformation_1.default.diskLayout())[0];
    const os = await systeminformation_1.default.osInfo();
    const versions = await systeminformation_1.default.versions();
    const ram = await systeminformation_1.default.mem();
    // CPU Info
    let info = `CPU: ${cpu.manufacturer} ${cpu.brand} ${cpu.speed}GHz\n`;
    info += `Cores: ${cpu.cores} (${cpu.physicalCores} Physical)\n`;
    // RAM Info
    const totalRam = Math.round(ram.total / 1024 / 1024 / 1024);
    info += `RAM: ${totalRam}GB\n`;
    // Disk Info
    const size = Math.round(disk.size / 1024 / 1024 / 1024);
    info += `Disk: ${disk.vendor} ${disk.name} ${size}GB ${disk.type} (${disk.interfaceType})\n`;
    //OS Info
    info += `OS: ${os.distro} ${os.codename} (${os.platform})\n`;
    info += `Kernel: ${os.kernel} ${os.arch}\n`;
    // Node Info
    info += `Node: v${versions.node}\n`;
    info += `V8: ${versions.v8}`;
    return info;
}
exports.getSystemInfo = getSystemInfo;
