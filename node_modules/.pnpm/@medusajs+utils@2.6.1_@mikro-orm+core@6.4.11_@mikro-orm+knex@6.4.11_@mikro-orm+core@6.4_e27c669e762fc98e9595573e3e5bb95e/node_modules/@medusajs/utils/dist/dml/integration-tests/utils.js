"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgGodCredentials = void 0;
const DB_HOST = process.env.DB_HOST ?? "localhost";
const DB_USERNAME = process.env.DB_USERNAME ?? "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
exports.pgGodCredentials = {
    user: DB_USERNAME,
    password: DB_PASSWORD,
    host: DB_HOST,
};
//# sourceMappingURL=utils.js.map