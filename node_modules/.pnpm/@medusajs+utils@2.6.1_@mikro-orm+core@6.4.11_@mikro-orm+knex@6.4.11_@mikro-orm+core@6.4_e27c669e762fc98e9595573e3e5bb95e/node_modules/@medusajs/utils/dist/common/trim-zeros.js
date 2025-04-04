"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimZeros = trimZeros;
function trimZeros(value) {
    const [whole, fraction] = value.split(".");
    if (fraction) {
        const exp = fraction.split("e");
        const decimal = exp[0].replace(/0+$/, "");
        const expStr = exp.length > 1 ? `e${exp[1]}` : "";
        if (!decimal) {
            return whole + expStr;
        }
        return `${whole}.${decimal}` + expStr;
    }
    return whole;
}
//# sourceMappingURL=trim-zeros.js.map