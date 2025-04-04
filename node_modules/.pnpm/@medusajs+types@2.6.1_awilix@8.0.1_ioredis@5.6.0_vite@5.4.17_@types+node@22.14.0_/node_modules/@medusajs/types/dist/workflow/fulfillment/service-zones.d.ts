import { CreateCityGeoZoneDTO, CreateCountryGeoZoneDTO, CreateProvinceGeoZoneDTO, CreateZipGeoZoneDTO, FilterableServiceZoneProps } from "../../fulfillment";
/**
 * The details of a service zone to create.
 */
interface CreateServiceZone {
    /**
     * The name of the service zone.
     */
    name: string;
    /**
     * The ID of the fulfillment set the service zone belongs to.
     */
    fulfillment_set_id: string;
    /**
     * The geo zones of the service zone.
     */
    geo_zones?: (Omit<CreateCountryGeoZoneDTO, "service_zone_id"> | Omit<CreateProvinceGeoZoneDTO, "service_zone_id"> | Omit<CreateCityGeoZoneDTO, "service_zone_id"> | Omit<CreateZipGeoZoneDTO, "service_zone_id">)[];
}
/**
 * The data to create service zones.
 */
export interface CreateServiceZonesWorkflowInput {
    /**
     * The service zones to create.
     */
    data: CreateServiceZone[];
}
/**
 * The data to update a service zone.
 */
interface UpdateServiceZone {
    /**
     * The name of the service zone.
     */
    name?: string | null;
    /**
     * Add new or existing geo zones to the service zone.
     */
    geo_zones?: (Omit<CreateCountryGeoZoneDTO, "service_zone_id"> | Omit<CreateProvinceGeoZoneDTO, "service_zone_id"> | Omit<CreateCityGeoZoneDTO, "service_zone_id"> | Omit<CreateZipGeoZoneDTO, "service_zone_id"> | {
        /**
         * The ID of the geo zone.
         */
        id: string;
    })[];
}
/**
 * The data to update service zones.
 */
export interface UpdateServiceZonesWorkflowInput {
    /**
     * The filters to select the service zones to update.
     */
    selector: FilterableServiceZoneProps;
    /**
     * The data to update in a service zone.
     */
    update: UpdateServiceZone;
}
export {};
//# sourceMappingURL=service-zones.d.ts.map