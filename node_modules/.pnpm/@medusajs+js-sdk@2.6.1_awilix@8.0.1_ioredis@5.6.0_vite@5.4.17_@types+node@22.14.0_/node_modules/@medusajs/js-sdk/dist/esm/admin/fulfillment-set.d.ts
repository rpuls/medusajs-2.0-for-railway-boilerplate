import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class FulfillmentSet {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    /**
     * This method deletes a fulfillment set. It sends a request to the
     * [Delete Fulfillment Set](https://docs.medusajs.com/api/admin#fulfillment-sets_deletefulfillmentsetsid)
     * API route.
     *
     * @param id - The fulfillment set's ID.
     * @param headers - Headers to pass in the request.
     * @returns The deletion's details.
     *
     * @example
     * sdk.admin.fulfillmentSet.delete("fset_123")
     * .then(({ deleted }) => {
     *   console.log(deleted)
     * })
     */
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminFulfillmentSetDeleteResponse>;
    /**
     * This method adds a service zone to a fulfillment set. It uses the
     * [Add Service Zone](https://docs.medusajs.com/api/admin#fulfillment-sets_postfulfillmentsetsidservicezones)
     * API route.
     *
     * @param id - The fulfillment set's ID.
     * @param body - The service zone's details.
     * @param query - Configure the fields to retrieve in the fulfillment set.
     * @param headers - Headers to pass in the request.
     * @returns The fulfillment set's details.
     *
     * @example
     * sdk.admin.fulfillmentSet.createServiceZone("fset_123", {
     *   name: "Europe Service Zone",
     *   geo_zones: [{
     *     type: "country",
     *     country_code: "us"
     *   }]
     * })
     * .then(({ fulfillment_set }) => {
     *   console.log(fulfillment_set)
     * })
     */
    createServiceZone(id: string, body: HttpTypes.AdminCreateFulfillmentSetServiceZone, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminFulfillmentSetResponse>;
    /**
     * This method retrieves a fulfillment set's service zone's details. It sends a request to the
     * [Get Service Zone](https://docs.medusajs.com/api/admin#fulfillment-sets_getfulfillmentsetsidservicezoneszone_id)
     * API route.
     *
     * @param fulfillmentSetId - The fulfillment set's ID.
     * @param serviceZoneId - The service zone's ID.
     * @param query - Configure the fields to retrieve in the service zone.
     * @param headers - Headers to pass in the request.
     * @returns The service zone's details.
     *
     * @example
     * To retrieve a fulfillment set's service zone by its ID:
     *
     * ```ts
     * sdk.admin.fulfillmentSet.retrieveServiceZone(
     *   "fset_123",
     *   "serzo_123"
     * )
     * .then(({ service_zone }) => {
     *   console.log(service_zone)
     * })
     * ```
     *
     * To specify the fields and relations to retrieve:
     *
     * ```ts
     * sdk.admin.fulfillmentSet.retrieveServiceZone(
     *   "fset_123",
     *   "serzo_123",
     *   {
     *     fields: "id,*geo_zones"
     *   }
     * )
     * .then(({ service_zone }) => {
     *   console.log(service_zone)
     * })
     * ```
     *
     * Learn more about the `fields` property in the [API reference](https://docs.medusajs.com/api/store#select-fields-and-relations).
     */
    retrieveServiceZone(fulfillmentSetId: string, serviceZoneId: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminServiceZoneResponse>;
    /**
     * This method updates a service zone in a fulfillment set. It sends a request to the
     * [Update Service Zone](https://docs.medusajs.com/api/admin#fulfillment-sets_postfulfillmentsetsidservicezoneszone_id)
     * API route.
     *
     * @param fulfillmentSetId - The fulfillment set's ID.
     * @param serviceZoneId - The service zone's ID.
     * @param body - The data to update in the service zone.
     * @param query - Configure the fields to retrieve in the fulfillment set.
     * @param headers - Headers to pass in the request.
     * @returns The fulfillment set's details.
     *
     * @example
     * sdk.admin.fulfillmentSet.updateServiceZone(
     *   "fset_123",
     *   "serzo_123",
     *   {
     *     name: "Europe Service Zone",
     *   }
     * )
     * .then(({ fulfillment_set }) => {
     *   console.log(fulfillment_set)
     * })
     */
    updateServiceZone(fulfillmentSetId: string, serviceZoneId: string, body: HttpTypes.AdminUpdateFulfillmentSetServiceZone, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminFulfillmentSetResponse>;
    /**
     * This method deletes a service zone in a fulfillment set. It sends a request to the
     * [Remove Service Zone](https://docs.medusajs.com/api/admin#fulfillment-sets_deletefulfillmentsetsidservicezoneszone_id)
     * API route.
     *
     * @param fulfillmentSetId - The fulfullment set's ID.
     * @param serviceZoneId - The service zone's ID.
     * @param headers - Headers to pass in the request.
     * @returns The deletion's details.
     *
     * @example
     * sdk.admin.fulfillmentSet.deleteServiceZone(
     *   "fset_123",
     *   "serzo_123",
     * )
     * .then(({ deleted, parent: fulfillmentSet }) => {
     *   console.log(deleted, fulfillmentSet)
     * })
     */
    deleteServiceZone(fulfillmentSetId: string, serviceZoneId: string, headers?: ClientHeaders): Promise<HttpTypes.AdminServiceZoneDeleteResponse>;
}
//# sourceMappingURL=fulfillment-set.d.ts.map