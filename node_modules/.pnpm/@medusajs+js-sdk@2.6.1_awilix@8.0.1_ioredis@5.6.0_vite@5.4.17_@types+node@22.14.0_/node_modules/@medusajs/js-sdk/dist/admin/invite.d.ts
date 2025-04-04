import { FindParams, HttpTypes, SelectParams } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class Invite {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
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
    accept(input: HttpTypes.AdminAcceptInvite & {
        /**
         * The invite's token.
         */
        invite_token: string;
    }, query?: SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminAcceptInviteResponse>;
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
    create(body: HttpTypes.AdminCreateInvite, query?: SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminInviteResponse>;
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
    retrieve(id: string, query?: SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminInviteResponse>;
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
    list(queryParams?: FindParams, headers?: ClientHeaders): Promise<HttpTypes.AdminInviteListResponse>;
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
    resend(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminInviteResponse>;
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
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminInviteDeleteResponse>;
}
//# sourceMappingURL=invite.d.ts.map