"use strict";
/*
|--------------------------------------------------------------------------
| PostgreSQL utilities
|--------------------------------------------------------------------------
|
| @note
| These utlities does not rely on an MedusaJS application and neither
| uses the Mikro ORM.
| The goal here is to run DB operations without booting the application.
|
| For example:
| Creating a database from CLI, or checking if a database exists
|
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConnectionString = parseConnectionString;
exports.createClient = createClient;
exports.createDb = createDb;
exports.dbExists = dbExists;
const pg_1 = require("pg");
const pg_connection_string_1 = require("pg-connection-string");
/**
 * Parsers the database connection string into an object
 * of postgreSQL options
 */
function parseConnectionString(connectionString) {
    return (0, pg_connection_string_1.parse)(connectionString);
}
/**
 * Creates a PostgreSQL database client using the connection
 * string or database options
 */
function createClient(options) {
    return new pg_1.Client(options);
}
/**
 * Creates a database using the client. Make sure to call
 * `client.connect` before using this utility.
 */
async function createDb(client, databaseName) {
    await client.query(`CREATE DATABASE "${databaseName}"`);
}
/**
 * Checks if a database exists using the Client.  Make sure to call
 * `client.connect` before using this utility.
 */
async function dbExists(client, databaseName) {
    const result = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname='${databaseName}';`);
    return !!result.rowCount;
}
//# sourceMappingURL=index.js.map