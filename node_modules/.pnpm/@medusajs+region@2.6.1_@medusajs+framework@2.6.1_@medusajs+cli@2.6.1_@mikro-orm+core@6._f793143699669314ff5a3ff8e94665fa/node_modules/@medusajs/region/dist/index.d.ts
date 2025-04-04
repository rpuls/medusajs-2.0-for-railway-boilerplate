import { RegionModuleService } from "./services";
declare const _default: import("@medusajs/types").ModuleExports<typeof RegionModuleService> & {
    linkable: {
        region: {
            id: {
                serviceName: "region";
                field: "region";
                linkable: "region_id";
                primaryKey: "id";
            };
            toJSON: () => {
                serviceName: "region";
                field: "region";
                linkable: "region_id";
                primaryKey: "id";
            };
        };
        country: {
            iso_2: {
                serviceName: "region";
                field: "country";
                linkable: "country_iso_2";
                primaryKey: "iso_2";
            };
            toJSON: () => {
                serviceName: "region";
                field: "country";
                linkable: "country_iso_2";
                primaryKey: "iso_2";
            };
        };
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map