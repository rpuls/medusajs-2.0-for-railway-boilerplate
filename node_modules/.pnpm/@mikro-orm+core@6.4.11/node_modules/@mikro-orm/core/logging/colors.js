"use strict";
/* istanbul ignore file */
Object.defineProperty(exports, "__esModule", { value: true });
exports.colors = void 0;
const bool = (v) => v && ['true', 't', '1'].includes(v.toLowerCase());
const boolIfDefined = (v) => v != null ? bool(v) : true;
const enabled = () => !bool(process.env.NO_COLOR)
    && !bool(process.env.MIKRO_ORM_NO_COLOR)
    && boolIfDefined(process.env.FORCE_COLOR)
    && boolIfDefined(process.env.MIKRO_ORM_COLORS);
const wrap = (fn) => (text) => enabled() ? fn(text) : text;
/** @internal */
exports.colors = {
    red: wrap((text) => `\x1B[31m${text}\x1B[39m`),
    green: wrap((text) => `\x1B[32m${text}\x1B[39m`),
    yellow: wrap((text) => `\x1B[33m${text}\x1B[39m`),
    grey: wrap((text) => `\x1B[90m${text}\x1B[39m`),
    cyan: wrap((text) => `\x1B[36m${text}\x1B[39m`),
    enabled,
};
