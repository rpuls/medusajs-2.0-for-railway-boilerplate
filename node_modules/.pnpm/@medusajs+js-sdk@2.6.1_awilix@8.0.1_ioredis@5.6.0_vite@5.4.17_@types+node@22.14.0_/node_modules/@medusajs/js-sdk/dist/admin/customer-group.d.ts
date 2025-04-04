import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class CustomerGroup {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    /**
     * This method retrieves a customer group by its ID. It sends a request to the
     * [Get Customer Group](https://docs.medusajs.com/api/admin#customer-groups_getcustomergroupsid) API route.
     *
     * @param id - The customer group's ID.
     * @param query - Configure the fields to retrieve in the customer group.
     * @param headers - Headers to pass in the request
     * @returns The group's details.
     *
     * @example
     * To retrieve a customer group by its ID:
     *
     * ```ts
     * sdk.admin.customerGroup.retrieve("cusgroup_123")
     * .then(({ customer_group }) => {
     *   console.log(customer_group)
     * })
     * ```
     *
     * To specify the fields and relations to retrieve:
     *
     * ```ts
     * sdk.admin.customerGroup.retrieve("cusgroup_123", {
     *   fields: "id,*customer"
     * })
     * .then(({ customer_group }) => {
     *   console.log(customer_group)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    retrieve(id: string, query?: HttpTypes.AdminGetCustomerGroupParams, headers?: ClientHeaders): Promise<HttpTypes.AdminCustomerGroupResponse>;
    /**
     * This method retrieves a paginated list of customer groups. It sends a request to the
     * [List Customer Groups](https://docs.medusajs.com/api/admin#customer-groups_getcustomergroups)
     * API route.
     *
     * @param query - Filters and pagination configurations.
     * @param headers - Headers to pass in the request.
     * @returns The paginated list of customer groups.
     *
     * @example
     * To retrieve the list of customer groups:
     *
     * ```ts
     * sdk.admin.customerGroup.list()
     * .then(({ customer_groups, count, limit, offset }) => {
     *   console.log(customer_groups)
     * })
     * ```
     *
     * To configure the pagination, pass the `limit` and `offset` query parameters.
     *
     * For example, to retrieve only 10 items and skip 10 items:
     *
     * ```ts
     * sdk.admin.customerGroup.list({
     *   limit: 10,
     *   offset: 10
     * })
     * .then(({ customer_groups, count, limit, offset }) => {
     *   console.log(customer_groups)
     * })
     * ```
     *
     * Using the `fields` query parameter, you can specify the fields and relations to retrieve
     * in each customer group:
     *
     * ```ts
     * sdk.admin.customerGroup.list({
     *   fields: "id,*customer"
     * })
     * .then(({ customer_groups, count, limit, offset }) => {
     *   console.log(customer_groups)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    list(query?: HttpTypes.AdminGetCustomerGroupsParams, headers?: ClientHeaders): Promise<HttpTypes.AdminCustomerGroupListResponse>;
    /**
     * This method creates a customer group. It sends a request to the
     * [Create Customer Group](https://docs.medusajs.com/api/admin#customer-groups_postcustomergroups)
     * API route.
     *
     * @param body - The customer group's details.
     * @param query - Configure the fields to retrieve in the customer group.
     * @param headers - Headers to pass in the request.
     * @returns The customer group's details.
     *
     * @example
     * sdk.admin.customerGroup.create({
     *   name: "VIP"
     * })
     * .then(({ customer_group }) => {
     *   console.log(customer_group)
     * })
     */
    create(body: HttpTypes.AdminCreateCustomerGroup, query?: HttpTypes.AdminGetCustomerGroupParams, headers?: ClientHeaders): Promise<HttpTypes.AdminCustomerGroupResponse>;
    /**
     * This method updates a customer group's details. It sends a request to the
     * [Update Customer](https://docs.medusajs.com/api/admin#customer-groups_postcustomergroupsid)
     * API route.
     *
     * @param id - The customer group's ID.
     * @param body - The details to update in the group.
     * @param query - Configure the fields to retrieve in the customer group.
     * @param headers - Headers to pass in the request.
     * @returns The customer group's details.
     *
     * @example
     * sdk.admin.customerGroup.update("cusgroup_123", {
     *   name: "VIP"
     * })
     * .then(({ customer_group }) => {
     *   console.log(customer_group)
     * })
     */
    update(id: string, body: HttpTypes.AdminUpdateCustomerGroup, query?: HttpTypes.AdminGetCustomerGroupParams, headers?: ClientHeaders): Promise<HttpTypes.AdminCustomerGroupResponse>;
    /**
     * This method deletes a customer group. This method sends a request to the
     * [Delete Customer Group](https://docs.medusajs.com/api/admin#customer-groups_deletecustomergroupsid)
     * API route.
     *
     * @param id - The customer group's ID.
     * @param headers - Headers to pass in the request
     * @returns The deletion's details.
     *
     * @example
     * sdk.admin.customerGroup.delete("cusgroup_123")
     * .then(({ deleted }) => {
     *   console.log(deleted)
     * })
     */
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminCustomerGroupDeleteResponse>;
    /**
     * This method manages customers of a group to add or remove them from the group.
     * It sends a request to the [Manage Customers](https://docs.medusajs.com/api/admin#customer-groups_postcustomergroupsidcustomers)
     * API route.
     *
     * @param id - The group's ID.
     * @param body - The customers to add or remove from the group.
     * @param headers - Headers to pass in the request
     * @returns The customer group's details.
     *
     * @example
     * sdk.admin.customerGroup.batchCustomers("cusgroup_123", {
     *   add: ["cus_123"],
     *   remove: ["cus_321"]
     * })
     * .then(({ customer_group }) => {
     *   console.log(customer_group)
     * })
     */
    batchCustomers(id: string, body: HttpTypes.AdminBatchLink, headers?: ClientHeaders): Promise<HttpTypes.AdminCustomerGroupResponse>;
}
//# sourceMappingURL=customer-group.d.ts.map