"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.didYouMean = didYouMean;
const meant_1 = __importDefault(require("meant"));
function didYouMean(scmd, commands) {
    const bestSimilarity = (0, meant_1.default)(scmd, commands).map((str) => {
        return `    ${str}`;
    });
    if (bestSimilarity.length === 0)
        return ``;
    if (bestSimilarity.length === 1) {
        return `\nDid you mean this?\n ${bestSimilarity[0]}\n`;
    }
    else {
        return ([`\nDid you mean one of these?`]
            .concat(bestSimilarity.slice(0, 3))
            .join(`\n`) + `\n`);
    }
}
//# sourceMappingURL=did-you-mean.js.map