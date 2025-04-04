var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
export class Invite {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * This method accepts an invite. It requires sending a previous request to
     * the {@link Auth.register}.
     *
     * This method sends a request to the [Accept Invite]
     * (https://docs.medusajs.com/api/admin#invites_postinvitesaccept)
     * API route.
     *
     * @param input - The details of the user to create.
     * @param query - Configure the fields to retrieve in the user.
     * @param headers - Headers to pass in the request
     * @returns The user's details.
     *
     * @example
     * const token = await sdk.auth.register("user", "emailpass", {
     *   email: "user@gmail.com",
     *   password: "supersecret"
     * })
     *
     * sdk.admin.invite.accept(
     *   {
     *     email: "user@gmail.com",
     *     first_name: "John",
     *     last_name: "Smith",
     *     invite_token: "12345..."
     *   },
     *   {
     *     Authorization: `Bearer ${token}`
     *   }
     * )
     * .then(({ user }) => {
     *   console.log(user)
     * })
     */
    accept(input, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            const { invite_token } = input, rest = __rest(input, ["invite_token"]);
            return yield this.client.fetch(`/admin/invites/accept?token=${input.invite_token}`, {
                method: "POST",
                headers,
                body: rest,
                query,
            });
        });
    }
    /**
     * This method creates an invite. It sends a request to the
     * [Create Invite](https://docs.medusajs.com/api/admin#invites_postinvites)
     * API route.
     *
     * @param body - The invite's details.
     * @param query - Configure the fields to retrieve in the invite.
     * @param headers - Headers to pass in the request
     * @returns The invite's details.
     *
     * @example
     * sdk.admin.invite.create({
     *   email: "user@gmail.com",
     * })
     * .then(({ invite }) => {
     *   console.log(invite)
     * })
     */
    create(body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/invites`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    /**
     * This method retrieves an invite by its ID. It sends a request to the
     * [Get Invite](https://docs.medusajs.com/api/admin#invites_getinvitesid)
     * API route.
     *
     * @param id - The invite's ID.
     * @param query - Configure the fields to retrieve in the invite.
     * @param headers - Headers to pass in the request
     * @returns The invite's details.
     *
     * @example
     * To retrieve an invite its ID:
     *
     * ```ts
     * sdk.admin.invite.retrieve("invite_123")
     * .then(({ invite }) => {
     *   console.log(invite)
     * })
     * ```
     *
     * To specify the fields and relations to retrieve:
     *
     * ```ts
     * sdk.admin.invite.retrieve("invite_123", {
     *   fields: "id,email"
     * })
     * .then(({ invite }) => {
     *   console.log(invite)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    retrieve(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/invites/${id}`, {
                headers,
                query,
            });
        });
    }
    /**
     * This method retrieves a paginated list of invites. It sends a request to the
     * [List Invites](https://docs.medusajs.com/api/admin#invites_getinvites)
     * API route.
     *
     * @param queryParams - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of invites.
     *
     * @example
     * To retrieve the list of invites:
     *
     * ```ts
     * sdk.admin.invite.list()
     * .then(({ invites, count, limit, offset }) => {
     *   console.log(invites)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.invite.list({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ invites, count, limit, offset }) => {
     *   console.log(invites)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each invite:
     *
     * ```ts
     * sdk.admin.invite.list({
     *   fields: "id,email"
     * })
     * .then(({ invites, count, limit, offset }) => {
     *   console.log(invites)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    list(queryParams, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/invites`, {
                headers,
                query: queryParams,
            });
        });
    }
    /**
     * This method refreshes the token of an invite. It sends a request to the
     * [Refresh Invite Token](https://docs.medusajs.com/api/admin#invites_postinvitesidresend)
     * API route.
     *
     * @param id - The invite's ID.
     * @param headers - Headers to pass in the request.
     * @returns The invite's details.
     *
     * @example
     * sdk.admin.invite.resend("invite_123")
     * .then(({ invite }) => {
     *   console.log(invite)
     * })
     */
    resend(id, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/invites/${id}/resend`, {
                method: "POST",
                headers,
            });
        });
    }
    /**
     * This method deletes an invite. It sends a request to the
     * [Delete Invite](https://docs.medusajs.com/api/admin#invites_deleteinvitesid)
     * API route.
     *
     * @param id - The invite's ID.
     * @param headers - Headers to pass in the request.
     * @returns The deletion's details.
     *
     * @example
     * sdk.admin.invite.delete("invite_123")
     * .then(({ deleted }) => {
     *   console.log(deleted)
     * })
     */
    delete(id, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/invites/${id}`, {
                method: "DELETE",
                headers,
            });
        });
    }
}
//# sourceMappingURL=invite.js.map