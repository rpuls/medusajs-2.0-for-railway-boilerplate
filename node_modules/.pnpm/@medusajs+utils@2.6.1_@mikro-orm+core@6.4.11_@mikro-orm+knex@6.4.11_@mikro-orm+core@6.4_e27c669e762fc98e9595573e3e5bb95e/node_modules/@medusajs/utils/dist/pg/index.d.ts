import { Client, type ClientConfig } from "pg";
/**
 * Parsers the database connection string into an object
 * of postgreSQL options
 */
export declare function parseConnectionString(connectionString: string): import("pg-connection-string").ConnectionOptions;
/**
 * Creates a PostgreSQL database client using the connection
 * string or database options
 */
export declare function createClient(options: string | ClientConfig): Client;
/**
 * Creates a database using the client. Make sure to call
 * `client.connect` before using this utility.
 */
export declare function createDb(client: Client, databaseName: string): Promise<void>;
/**
 * Checks if a database exists using the Client.  Make sure to call
 * `client.connect` before using this utility.
 */
export declare function dbExists(client: Client, databaseName: string): Promise<boolean>;
//# sourceMappingURL=index.d.ts.map