import { Admin } from "./admin";
import { Auth } from "./auth";
import { Client } from "./client";
import { Store } from "./store";
import { Config } from "./types";
declare class Medusa {
    client: Client;
    admin: Admin;
    store: Store;
    auth: Auth;
    constructor(config: Config);
}
export default Medusa;
export { FetchError, Client } from "./client";
export { Admin } from "./admin";
export { Auth } from "./auth";
export { Store } from "./store";
export { Config, ClientHeaders, ClientFetch, FetchArgs, FetchInput, FetchStreamResponse, Logger, ServerSentEventMessage, } from "./types";
//# sourceMappingURL=index.d.ts.map