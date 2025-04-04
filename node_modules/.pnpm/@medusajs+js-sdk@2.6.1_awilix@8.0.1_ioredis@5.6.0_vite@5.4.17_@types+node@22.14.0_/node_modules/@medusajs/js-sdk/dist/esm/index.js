import { Admin } from "./admin";
import { Auth } from "./auth";
import { Client } from "./client";
import { Store } from "./store";
class Medusa {
    constructor(config) {
        this.client = new Client(config);
        this.admin = new Admin(this.client);
        this.store = new Store(this.client);
        this.auth = new Auth(this.client, config);
    }
}
export default Medusa;
export { FetchError, Client } from "./client";
export { Admin } from "./admin";
export { Auth } from "./auth";
export { Store } from "./store";
//# sourceMappingURL=index.js.map