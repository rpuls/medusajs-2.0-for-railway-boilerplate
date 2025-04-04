import { Fulfillment, FulfillmentSet, ServiceZone, ShippingOption } from "../models";
import { Context, InferEntityType } from "@medusajs/framework/types";
export declare const eventBuilders: {
    createdFulfillment: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    updatedFulfillment: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    createdFulfillmentAddress: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    createdFulfillmentItem: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    createdFulfillmentLabel: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    updatedFulfillmentLabel: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    deletedFulfillmentLabel: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    createdShippingProfile: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    createdShippingOptionType: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    updatedShippingOptionType: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    deletedShippingOptionType: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    createdShippingOptionRule: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    updatedShippingOptionRule: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    deletedShippingOptionRule: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    createdShippingOption: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    updatedShippingOption: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    createdFulfillmentSet: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    updatedFulfillmentSet: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    deletedFulfillmentSet: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    createdServiceZone: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    updatedServiceZone: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    deletedServiceZone: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    createdGeoZone: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    updatedGeoZone: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
    deletedGeoZone: ({ data, sharedContext, }: {
        data: {
            id: string;
        } | {
            id: string;
        }[];
        sharedContext: Context;
    }) => void;
};
export declare function buildCreatedFulfillmentEvents({ fulfillments, sharedContext, }: {
    fulfillments: InferEntityType<typeof Fulfillment>[];
    sharedContext: Context;
}): void;
export declare function buildCreatedShippingOptionEvents({ shippingOptions, sharedContext, }: {
    shippingOptions: InferEntityType<typeof ShippingOption>[];
    sharedContext: Context;
}): void;
export declare function buildCreatedFulfillmentSetEvents({ fulfillmentSets, sharedContext, }: {
    fulfillmentSets: InferEntityType<typeof FulfillmentSet>[];
    sharedContext: Context;
}): void;
export declare function buildCreatedServiceZoneEvents({ serviceZones, sharedContext, }: {
    serviceZones: InferEntityType<typeof ServiceZone>[];
    sharedContext: Context;
}): void;
//# sourceMappingURL=events.d.ts.map