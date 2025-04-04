export declare function prepareShippingMethod(relatedEntityField?: string): (data: any) => any;
export declare function prepareShippingMethodUpdate({ input, orderChange, shippingOptions, }: {
    input: any;
    orderChange: any;
    shippingOptions: any;
}): {
    action: {
        id: string;
        amount: any;
        internal_note: any;
    };
    shippingMethod: {
        id: string;
        amount: any;
        is_custom_amount: boolean;
        metadata: any;
    };
};
//# sourceMappingURL=prepare-shipping-method.d.ts.map