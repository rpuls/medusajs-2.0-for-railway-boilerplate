export interface StoreJson {
    openapi: string;
    info: Info;
    servers: Server[];
    tags: Tag[];
    paths: Paths;
    components: Components;
}

export interface Info {
    version: string;
    title: string;
    license: License;
}

export interface License {
    name: string;
    url: string;
}

export interface Server {
    url: string;
}

export interface Tag {
    "name": string;
    "description"?: string;
    "externalDocs"?: ExternalDocs;
    "x-associatedSchema"?: XAssociatedSchema;
}

export interface ExternalDocs {
    description: string;
    url: string;
}

export interface XAssociatedSchema {
    $ref: string;
}

export type SdkRequestType =
    | AuthCustomerAuthProvider
    | AuthCustomerAuthProviderCallback
    | AuthCustomerAuthProviderRegister
    | AuthCustomerAuthProviderResetPassword
    | AuthCustomerAuthProviderUpdate
    | AuthSession
    | AuthTokenRefresh
    | StoreCarts
    | StoreCartsId
    | StoreCartsIdComplete
    | StoreCartsIdCustomer
    | StoreCartsIdLineItems
    | StoreCartsIdLineItemsLineId
    | StoreCartsIdPromotions
    | StoreCartsIdShippingMethods
    | StoreCartsIdTaxes
    | StoreCollections
    | StoreCollectionsId
    | StoreCurrencies
    | StoreCurrenciesCode
    | StoreCustomers
    | StoreCustomersMe
    | StoreCustomersMeAddresses
    | StoreCustomersMeAddressesAddressId
    | StoreOrders
    | StoreOrdersId
    | StoreOrdersIdTransferAccept
    | StoreOrdersIdTransferCancel
    | StoreOrdersIdTransferDecline
    | StoreOrdersIdTransferRequest
    | StorePaymentCollections
    | StorePaymentCollectionsIdPaymentSessions
    | StorePaymentProviders
    | StoreProductCategories
    | StoreProductCategoriesId
    | StoreProductTags
    | StoreProductTagsId
    | StoreProductTypes
    | StoreProductTypesId
    | StoreProducts
    | StoreProductsId
    | StoreRegions
    | StoreRegionsId
    | StoreReturnReasons;

export type PathInterface = Record<string, SdkRequestType>;

export interface Paths {
    "/auth/customer/{auth_provider}": AuthCustomerAuthProvider;
    "/auth/customer/{auth_provider}/callback": AuthCustomerAuthProviderCallback;
    "/auth/customer/{auth_provider}/register": AuthCustomerAuthProviderRegister;
    "/auth/customer/{auth_provider}/reset-password": AuthCustomerAuthProviderResetPassword;
    "/auth/customer/{auth_provider}/update": AuthCustomerAuthProviderUpdate;
    "/auth/session": AuthSession;
    "/auth/token/refresh": AuthTokenRefresh;
    "/store/carts": StoreCarts;
    "/store/carts/{id}": StoreCartsId;
    "/store/carts/{id}/complete": StoreCartsIdComplete;
    "/store/carts/{id}/customer": StoreCartsIdCustomer;
    "/store/carts/{id}/line-items": StoreCartsIdLineItems;
    "/store/carts/{id}/line-items/{line_id}": StoreCartsIdLineItemsLineId;
    "/store/carts/{id}/promotions": StoreCartsIdPromotions;
    "/store/carts/{id}/shipping-methods": StoreCartsIdShippingMethods;
    "/store/carts/{id}/taxes": StoreCartsIdTaxes;
    "/store/collections": StoreCollections;
    "/store/collections/{id}": StoreCollectionsId;
    "/store/currencies": StoreCurrencies;
    "/store/currencies/{code}": StoreCurrenciesCode;
    "/store/customers": StoreCustomers;
    "/store/customers/me": StoreCustomersMe;
    "/store/customers/me/addresses": StoreCustomersMeAddresses;
    "/store/customers/me/addresses/{address_id}": StoreCustomersMeAddressesAddressId;
    "/store/orders": StoreOrders;
    "/store/orders/{id}": StoreOrdersId;
    "/store/orders/{id}/transfer/accept": StoreOrdersIdTransferAccept;
    "/store/orders/{id}/transfer/cancel": StoreOrdersIdTransferCancel;
    "/store/orders/{id}/transfer/decline": StoreOrdersIdTransferDecline;
    "/store/orders/{id}/transfer/request": StoreOrdersIdTransferRequest;
    "/store/payment-collections": StorePaymentCollections;
    "/store/payment-collections/{id}/payment-sessions": StorePaymentCollectionsIdPaymentSessions;
    "/store/payment-providers": StorePaymentProviders;
    "/store/product-categories": StoreProductCategories;
    "/store/product-categories/{id}": StoreProductCategoriesId;
    "/store/product-tags": StoreProductTags;
    "/store/product-tags/{id}": StoreProductTagsId;
    "/store/product-types": StoreProductTypes;
    "/store/product-types/{id}": StoreProductTypesId;
    "/store/products": StoreProducts;
    "/store/products/{id}": StoreProductsId;
    "/store/regions": StoreRegions;
    "/store/regions/{id}": StoreRegionsId;
    "/store/return": StoreReturn;
    "/store/return-reasons": StoreReturnReasons;
    "/store/return-reasons/{id}": StoreReturnReasonsId;
    "/store/shipping-options": StoreShippingOptions;
    "/store/shipping-options/{id}/calculate": StoreShippingOptionsIdCalculate;
}

export interface AuthCustomerAuthProvider {
    post: Post;
}

export interface Post {
    "operationId": string;
    "summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses;
}

export interface Parameter {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema;
}

export interface Schema {
    type: string;
    example: string;
}

export interface RequestBody {
    content: Content;
}

export interface Content {
    "application/json": ApplicationJson;
}

export interface ApplicationJson {
    schema: Schema2;
}

export interface Schema2 {
    type: string;
    title: string;
    description: string;
}

export interface CodeSample {
    lang: string;
    label: string;
    source: string;
}

export interface Responses {
    "200": N200;
    "400": N400;
    "401": N401;
    "404": N404;
    "409": N409;
    "422": N422;
    "500": N500;
}

export interface N200 {
    description: string;
    content: Content2;
}

export interface Content2 {
    "application/json": ApplicationJson2;
}

export interface ApplicationJson2 {
    schema: Schema3;
}

export interface Schema3 {
    oneOf: OneOf[];
}

export interface OneOf {
    $ref: string;
}

export interface N400 {
    $ref: string;
}

export interface N401 {
    $ref: string;
}

export interface N404 {
    $ref: string;
}

export interface N409 {
    $ref: string;
}

export interface N422 {
    $ref: string;
}

export interface N500 {
    $ref: string;
}

export interface AuthCustomerAuthProviderCallback {
    post: Post2;
}

export interface Post2 {
    "operationId": string;
    "summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses2;
}

export interface ExternalDocs3 {
    url: string;
    description: string;
}

export interface Parameter2 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema4;
}

export interface Schema4 {
    type: string;
    example: string;
}

export interface CodeSample2 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses2 {
    "200": N2002;
    "400": N4002;
    "401": N4012;
    "404": N4042;
    "409": N4092;
    "422": N4222;
    "500": N5002;
}

export interface N2002 {
    description: string;
    content: Content3;
}

export interface Content3 {
    "application/json": ApplicationJson3;
}

export interface ApplicationJson3 {
    schema: Schema5;
}

export interface Schema5 {
    $ref: string;
}

export interface N4002 {
    $ref: string;
}

export interface N4012 {
    $ref: string;
}

export interface N4042 {
    $ref: string;
}

export interface N4092 {
    $ref: string;
}

export interface N4222 {
    $ref: string;
}

export interface N5002 {
    $ref: string;
}

export interface AuthCustomerAuthProviderRegister {
    post: Post3;
}

export interface Post3 {
    "operationId": string;
    "summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody2;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses3;
}

export interface ExternalDocs4 {
    url: string;
    description: string;
}

export interface Parameter3 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema6;
}

export interface Schema6 {
    type: string;
    example: string;
}

export interface RequestBody2 {
    content: Content4;
}

export interface Content4 {
    "application/json": ApplicationJson4;
}

export interface ApplicationJson4 {
    schema: Schema7;
}

export interface Schema7 {
    type: string;
    title: string;
    description: string;
    example: Example;
}

export interface Example {
    email: string;
    password: string;
}

export interface CodeSample3 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses3 {
    "200": N2003;
    "400": N4003;
    "401": N4013;
    "404": N4043;
    "409": N4093;
    "422": N4223;
    "500": N5003;
}

export interface N2003 {
    description: string;
    content: Content5;
}

export interface Content5 {
    "application/json": ApplicationJson5;
}

export interface ApplicationJson5 {
    schema: Schema8;
}

export interface Schema8 {
    $ref: string;
}

export interface N4003 {
    $ref: string;
}

export interface N4013 {
    $ref: string;
}

export interface N4043 {
    $ref: string;
}

export interface N4093 {
    $ref: string;
}

export interface N4223 {
    $ref: string;
}

export interface N5003 {
    $ref: string;
}

export interface AuthCustomerAuthProviderResetPassword {
    post: Post4;
}

export interface Post4 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody3;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses4;
    "x-workflow": string;
}

export interface ExternalDocs5 {
    url: string;
    description: string;
}

export interface Parameter4 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema9;
}

export interface Schema9 {
    type: string;
    example: string;
}

export interface RequestBody3 {
    content: Content6;
}

export interface Content6 {
    "application/json": ApplicationJson6;
}

export interface ApplicationJson6 {
    schema: Schema10;
}

export interface Schema10 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface CodeSample4 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses4 {
    "201": N201;
    "400": N4004;
    "401": N4014;
    "404": N4044;
    "409": N4094;
    "422": N4224;
    "500": N5004;
}

export interface N201 {
    description: string;
}

export interface N4004 {
    $ref: string;
}

export interface N4014 {
    $ref: string;
}

export interface N4044 {
    $ref: string;
}

export interface N4094 {
    $ref: string;
}

export interface N4224 {
    $ref: string;
}

export interface N5004 {
    $ref: string;
}

export interface AuthCustomerAuthProviderUpdate {
    post: Post5;
}

export interface Post5 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody4;
    "x-codeSamples": CodeSample[];
    "security": Security[];
    "tags": string[];
    "responses": Responses5;
}

export interface ExternalDocs6 {
    url: string;
    description: string;
}

export interface Parameter5 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema11;
}

export interface Schema11 {
    type: string;
    example: string;
}

export interface RequestBody4 {
    content: Content7;
}

export interface Content7 {
    "application/json": ApplicationJson7;
}

export interface ApplicationJson7 {
    schema: Schema12;
}

export interface Schema12 {
    type: string;
    title: string;
    description: string;
    example: Example2;
}

export interface Example2 {
    email: string;
    password: string;
}

export interface CodeSample5 {
    lang: string;
    label: string;
    source: string;
}

export interface Security {
    reset_password: any[];
}

export interface Responses5 {
    "200": N2004;
    "400": N4005;
    "401": N4015;
    "404": N4045;
    "409": N4095;
    "422": N4225;
    "500": N5005;
}

export interface N2004 {
    description: string;
    content: Content8;
}

export interface Content8 {
    "application/json": ApplicationJson8;
}

export interface ApplicationJson8 {
    schema: Schema13;
}

export interface Schema13 {
    type: string;
    required: string[];
    description: string;
    properties: Properties;
}

export interface Properties {
    success: Success;
}

export interface Success {
    type: string;
    title: string;
    description: string;
}

export interface N4005 {
    $ref: string;
}

export interface N4015 {
    $ref: string;
}

export interface N4045 {
    $ref: string;
}

export interface N4095 {
    $ref: string;
}

export interface N4225 {
    $ref: string;
}

export interface N5005 {
    $ref: string;
}

export interface AuthSession {
    post: Post6;
    delete: Delete;
}

export interface Post6 {
    "operationId": string;
    "summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "x-authenticated": boolean;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses6;
}

export interface ExternalDocs7 {
    url: string;
    description: string;
}

export interface CodeSample6 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses6 {
    "200": N2005;
    "400": N4006;
    "401": N4016;
    "404": N4046;
    "409": N4096;
    "422": N4226;
    "500": N5006;
}

export interface N2005 {
    description: string;
    content: Content9;
}

export interface Content9 {
    "application/json": ApplicationJson9;
}

export interface ApplicationJson9 {
    schema: Schema14;
}

export interface Schema14 {
    $ref: string;
}

export interface N4006 {
    $ref: string;
}

export interface N4016 {
    $ref: string;
}

export interface N4046 {
    $ref: string;
}

export interface N4096 {
    $ref: string;
}

export interface N4226 {
    $ref: string;
}

export interface N5006 {
    $ref: string;
}

export interface Delete {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses7;
}

export interface CodeSample7 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses7 {
    "200": N2006;
    "400": N4007;
    "401": N4017;
    "404": N4047;
    "409": N4097;
    "422": N4227;
    "500": N5007;
}

export interface N2006 {
    description: string;
    content: Content10;
}

export interface Content10 {
    "application/json": ApplicationJson10;
}

export interface ApplicationJson10 {
    schema: Schema15;
}

export interface Schema15 {
    type: string;
    description: string;
    required: string[];
    properties: Properties2;
}

export interface Properties2 {
    success: Success2;
}

export interface Success2 {
    type: string;
    title: string;
    description: string;
}

export interface N4007 {
    $ref: string;
}

export interface N4017 {
    $ref: string;
}

export interface N4047 {
    $ref: string;
}

export interface N4097 {
    $ref: string;
}

export interface N4227 {
    $ref: string;
}

export interface N5007 {
    $ref: string;
}

export interface AuthTokenRefresh {
    post: Post7;
}

export interface Post7 {
    "operationId": string;
    "summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "parameters"?: Parameter[];
    "x-authenticated": boolean;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses8;
}

export interface ExternalDocs8 {
    url: string;
    description: string;
}

export interface CodeSample8 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses8 {
    "200": N2007;
    "400": N4008;
    "401": N4018;
    "404": N4048;
    "409": N4098;
    "422": N4228;
    "500": N5008;
}

export interface N2007 {
    description: string;
    content: Content11;
}

export interface Content11 {
    "application/json": ApplicationJson11;
}

export interface ApplicationJson11 {
    schema: Schema16;
}

export interface Schema16 {
    $ref: string;
}

export interface N4008 {
    $ref: string;
}

export interface N4018 {
    $ref: string;
}

export interface N4048 {
    $ref: string;
}

export interface N4098 {
    $ref: string;
}

export interface N4228 {
    $ref: string;
}

export interface N5008 {
    $ref: string;
}

export interface StoreCarts {
    post: Post8;
}

export interface Post8 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody5;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses9;
    "x-workflow": string;
}

export interface Parameter6 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema17;
}

export interface Schema17 {
    type: string;
    externalDocs: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs9 {
    url: string;
}

export interface RequestBody5 {
    content: Content12;
}

export interface Content12 {
    "application/json": ApplicationJson12;
}

export interface ApplicationJson12 {
    schema: Schema18;
}

export interface Schema18 {
    allOf: AllOf[];
    description: string;
}

export interface AllOf {
    $ref?: string;
    type?: string;
    description?: string;
    properties?: Properties3;
}

export interface Properties3 {
    additional_data: AdditionalData;
}

export interface AdditionalData {
    type: string;
    description: string;
}

export interface CodeSample9 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses9 {
    "200": N2008;
    "400": N4009;
    "401": N4019;
    "404": N4049;
    "409": N4099;
    "422": N4229;
    "500": N5009;
}

export interface N2008 {
    description: string;
    content: Content13;
}

export interface Content13 {
    "application/json": ApplicationJson13;
}

export interface ApplicationJson13 {
    schema: Schema19;
}

export interface Schema19 {
    $ref: string;
}

export interface N4009 {
    $ref: string;
}

export interface N4019 {
    $ref: string;
}

export interface N4049 {
    $ref: string;
}

export interface N4099 {
    $ref: string;
}

export interface N4229 {
    $ref: string;
}

export interface N5009 {
    $ref: string;
}

export interface StoreCartsId {
    get: Get;
    post: Post9;
}

export interface Get {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses10;
}

export interface Parameter7 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema20;
}

export interface Schema20 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs10 {
    url: string;
}

export interface CodeSample10 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses10 {
    "200": N2009;
    "400": N40010;
    "401": N40110;
    "404": N40410;
    "409": N40910;
    "422": N42210;
    "500": N50010;
}

export interface N2009 {
    description: string;
    content: Content14;
}

export interface Content14 {
    "application/json": ApplicationJson14;
}

export interface ApplicationJson14 {
    schema: Schema21;
}

export interface Schema21 {
    $ref: string;
}

export interface N40010 {
    $ref: string;
}

export interface N40110 {
    $ref: string;
}

export interface N40410 {
    $ref: string;
}

export interface N40910 {
    $ref: string;
}

export interface N42210 {
    $ref: string;
}

export interface N50010 {
    $ref: string;
}

export interface Post9 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody6;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses11;
    "x-workflow": string;
}

export interface Parameter8 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema22;
}

export interface Schema22 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs11 {
    url: string;
}

export interface RequestBody6 {
    content: Content15;
}

export interface Content15 {
    "application/json": ApplicationJson15;
}

export interface ApplicationJson15 {
    schema: Schema23;
}

export interface Schema23 {
    allOf: AllOf2[];
    description: string;
}

export interface AllOf2 {
    $ref?: string;
    type?: string;
    description?: string;
    properties?: Properties4;
}

export interface Properties4 {
    additional_data: AdditionalData2;
}

export interface AdditionalData2 {
    type: string;
    description: string;
}

export interface CodeSample11 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses11 {
    "200": N20010;
    "400": N40011;
    "401": N40111;
    "404": N40411;
    "409": N40911;
    "422": N42211;
    "500": N50011;
}

export interface N20010 {
    description: string;
    content: Content16;
}

export interface Content16 {
    "application/json": ApplicationJson16;
}

export interface ApplicationJson16 {
    schema: Schema24;
}

export interface Schema24 {
    type: string;
    description: string;
    required: string[];
    properties: Properties5;
}

export interface Properties5 {
    cart: Cart;
}

export interface Cart {
    $ref: string;
}

export interface N40011 {
    $ref: string;
}

export interface N40111 {
    $ref: string;
}

export interface N40411 {
    $ref: string;
}

export interface N40911 {
    $ref: string;
}

export interface N42211 {
    $ref: string;
}

export interface N50011 {
    $ref: string;
}

export interface StoreCartsIdComplete {
    post: Post10;
}

export interface Post10 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses12;
    "x-workflow": string;
}

export interface ExternalDocs12 {
    url: string;
    description: string;
}

export interface Parameter9 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema25;
}

export interface Schema25 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs13 {
    url: string;
}

export interface CodeSample12 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses12 {
    "200": N20011;
    "400": N40012;
    "401": N40112;
    "404": N40412;
    "409": N40912;
    "422": N42212;
    "500": N50012;
}

export interface N20011 {
    description: string;
    content: Content17;
}

export interface Content17 {
    "application/json": ApplicationJson17;
}

export interface ApplicationJson17 {
    schema: Schema26;
}

export interface Schema26 {
    oneOf: OneOf2[];
}

export interface OneOf2 {
    type: string;
    description: string;
    required: string[];
    properties: Properties6;
}

export interface Properties6 {
    type: Type;
    order?: Order;
    cart?: Cart2;
    error?: Error;
}

export interface Type {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Order {
    $ref: string;
}

export interface Cart2 {
    $ref: string;
}

export interface Error {
    type: string;
    description: string;
    required: string[];
    properties: Properties7;
}

export interface Properties7 {
    message: Message;
    name: Name;
    type: Type2;
}

export interface Message {
    type: string;
    title: string;
    description: string;
}

export interface Name {
    type: string;
    title: string;
    description: string;
}

export interface Type2 {
    type: string;
    title: string;
    description: string;
}

export interface N40012 {
    $ref: string;
}

export interface N40112 {
    $ref: string;
}

export interface N40412 {
    $ref: string;
}

export interface N40912 {
    $ref: string;
}

export interface N42212 {
    $ref: string;
}

export interface N50012 {
    $ref: string;
}

export interface StoreCartsIdCustomer {
    post: Post11;
}

export interface Post11 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses13;
    "x-workflow": string;
}

export interface ExternalDocs14 {
    url: string;
    description: string;
}

export interface Parameter10 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema27;
}

export interface Schema27 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs15 {
    url: string;
}

export interface CodeSample13 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses13 {
    "200": N20012;
    "400": N40013;
    "401": N40113;
    "404": N40413;
    "409": N40913;
    "422": N42213;
    "500": N50013;
}

export interface N20012 {
    description: string;
    content: Content18;
}

export interface Content18 {
    "application/json": ApplicationJson18;
}

export interface ApplicationJson18 {
    schema: Schema28;
}

export interface Schema28 {
    $ref: string;
}

export interface N40013 {
    $ref: string;
}

export interface N40113 {
    $ref: string;
}

export interface N40413 {
    $ref: string;
}

export interface N40913 {
    $ref: string;
}

export interface N42213 {
    $ref: string;
}

export interface N50013 {
    $ref: string;
}

export interface StoreCartsIdLineItems {
    post: Post12;
}

export interface Post12 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody7;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses14;
    "x-workflow": string;
}

export interface ExternalDocs16 {
    url: string;
    description: string;
}

export interface Parameter11 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema29;
}

export interface Schema29 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs17 {
    url: string;
}

export interface RequestBody7 {
    content: Content19;
}

export interface Content19 {
    "application/json": ApplicationJson19;
}

export interface ApplicationJson19 {
    schema: Schema30;
}

export interface Schema30 {
    $ref: string;
}

export interface CodeSample14 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses14 {
    "200": N20013;
    "400": N40014;
    "401": N40114;
    "404": N40414;
    "409": N40914;
    "422": N42214;
    "500": N50014;
}

export interface N20013 {
    description: string;
    content: Content20;
}

export interface Content20 {
    "application/json": ApplicationJson20;
}

export interface ApplicationJson20 {
    schema: Schema31;
}

export interface Schema31 {
    $ref: string;
}

export interface N40014 {
    $ref: string;
}

export interface N40114 {
    $ref: string;
}

export interface N40414 {
    $ref: string;
}

export interface N40914 {
    $ref: string;
}

export interface N42214 {
    $ref: string;
}

export interface N50014 {
    $ref: string;
}

export interface StoreCartsIdLineItemsLineId {
    post: Post13;
    delete: Delete2;
}

export interface Post13 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody8;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses15;
    "x-workflow": string;
}

export interface ExternalDocs18 {
    url: string;
    description: string;
}

export interface Parameter12 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema32;
}

export interface Schema32 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs19 {
    url: string;
}

export interface RequestBody8 {
    content: Content21;
}

export interface Content21 {
    "application/json": ApplicationJson21;
}

export interface ApplicationJson21 {
    schema: Schema33;
}

export interface Schema33 {
    $ref: string;
}

export interface CodeSample15 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses15 {
    "200": N20014;
    "400": N40015;
    "401": N40115;
    "404": N40415;
    "409": N40915;
    "422": N42215;
    "500": N50015;
}

export interface N20014 {
    description: string;
    content: Content22;
}

export interface Content22 {
    "application/json": ApplicationJson22;
}

export interface ApplicationJson22 {
    schema: Schema34;
}

export interface Schema34 {
    $ref: string;
}

export interface N40015 {
    $ref: string;
}

export interface N40115 {
    $ref: string;
}

export interface N40415 {
    $ref: string;
}

export interface N40915 {
    $ref: string;
}

export interface N42215 {
    $ref: string;
}

export interface N50015 {
    $ref: string;
}

export interface Delete2 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses16;
    "x-workflow": string;
}

export interface ExternalDocs20 {
    url: string;
    description: string;
}

export interface Parameter13 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema35;
}

export interface Schema35 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs21 {
    url: string;
}

export interface CodeSample16 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses16 {
    "200": N20015;
    "400": N40016;
    "401": N40116;
    "404": N40416;
    "409": N40916;
    "422": N42216;
    "500": N50016;
}

export interface N20015 {
    description: string;
    content: Content23;
}

export interface Content23 {
    "application/json": ApplicationJson23;
}

export interface ApplicationJson23 {
    schema: Schema36;
}

export interface Schema36 {
    allOf: AllOf3[];
    description: string;
}

export interface AllOf3 {
    type: string;
    description: string;
    required?: string[];
    properties: Properties8;
}

export interface Properties8 {
    id?: Id;
    object?: Object;
    deleted?: Deleted;
    parent?: Parent;
}

export interface Id {
    type: string;
    title: string;
    description: string;
}

export interface Object {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted {
    type: string;
    title: string;
    description: string;
}

export interface Parent {
    $ref: string;
    description: string;
}

export interface N40016 {
    $ref: string;
}

export interface N40116 {
    $ref: string;
}

export interface N40416 {
    $ref: string;
}

export interface N40916 {
    $ref: string;
}

export interface N42216 {
    $ref: string;
}

export interface N50016 {
    $ref: string;
}

export interface StoreCartsIdPromotions {
    post: Post14;
    delete: Delete3;
}

export interface Post14 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody9;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses17;
    "x-workflow": string;
}

export interface Parameter14 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema37;
}

export interface Schema37 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs22 {
    url: string;
}

export interface RequestBody9 {
    content: Content24;
}

export interface Content24 {
    "application/json": ApplicationJson24;
}

export interface ApplicationJson24 {
    schema: Schema38;
}

export interface Schema38 {
    $ref: string;
}

export interface CodeSample17 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses17 {
    "200": N20016;
    "400": N40017;
    "401": N40117;
    "404": N40417;
    "409": N40917;
    "422": N42217;
    "500": N50017;
}

export interface N20016 {
    description: string;
    content: Content25;
}

export interface Content25 {
    "application/json": ApplicationJson25;
}

export interface ApplicationJson25 {
    schema: Schema39;
}

export interface Schema39 {
    $ref: string;
}

export interface N40017 {
    $ref: string;
}

export interface N40117 {
    $ref: string;
}

export interface N40417 {
    $ref: string;
}

export interface N40917 {
    $ref: string;
}

export interface N42217 {
    $ref: string;
}

export interface N50017 {
    $ref: string;
}

export interface Delete3 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses18;
    "x-workflow": string;
}

export interface Parameter15 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema40;
}

export interface Schema40 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs23 {
    url: string;
}

export interface CodeSample18 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses18 {
    "200": N20017;
    "400": N40018;
    "401": N40118;
    "404": N40418;
    "409": N40918;
    "422": N42218;
    "500": N50018;
}

export interface N20017 {
    description: string;
    content: Content26;
}

export interface Content26 {
    "application/json": ApplicationJson26;
}

export interface ApplicationJson26 {
    schema: Schema41;
}

export interface Schema41 {
    type: string;
    description: string;
    required: string[];
    properties: Properties9;
}

export interface Properties9 {
    cart: Cart3;
}

export interface Cart3 {
    $ref: string;
}

export interface N40018 {
    $ref: string;
}

export interface N40118 {
    $ref: string;
}

export interface N40418 {
    $ref: string;
}

export interface N40918 {
    $ref: string;
}

export interface N42218 {
    $ref: string;
}

export interface N50018 {
    $ref: string;
}

export interface StoreCartsIdShippingMethods {
    post: Post15;
}

export interface Post15 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody10;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses19;
    "x-workflow": string;
}

export interface ExternalDocs24 {
    url: string;
    description: string;
}

export interface Parameter16 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema42;
}

export interface Schema42 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs25 {
    url: string;
}

export interface RequestBody10 {
    content: Content27;
}

export interface Content27 {
    "application/json": ApplicationJson27;
}

export interface ApplicationJson27 {
    schema: Schema43;
}

export interface Schema43 {
    type: string;
    description: string;
    required: string[];
    properties: Properties10;
}

export interface Properties10 {
    option_id: OptionId;
    data: Data;
}

export interface OptionId {
    type: string;
    title: string;
    description: string;
}

export interface Data {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs26 {
    url: string;
    description: string;
}

export interface CodeSample19 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses19 {
    "200": N20018;
    "400": N40019;
    "401": N40119;
    "404": N40419;
    "409": N40919;
    "422": N42219;
    "500": N50019;
}

export interface N20018 {
    description: string;
    content: Content28;
}

export interface Content28 {
    "application/json": ApplicationJson28;
}

export interface ApplicationJson28 {
    schema: Schema44;
}

export interface Schema44 {
    $ref: string;
}

export interface N40019 {
    $ref: string;
}

export interface N40119 {
    $ref: string;
}

export interface N40419 {
    $ref: string;
}

export interface N40919 {
    $ref: string;
}

export interface N42219 {
    $ref: string;
}

export interface N50019 {
    $ref: string;
}

export interface StoreCartsIdTaxes {
    post: Post16;
}

export interface Post16 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses20;
    "x-workflow": string;
}

export interface Parameter17 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema45;
}

export interface Schema45 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs27 {
    url: string;
}

export interface CodeSample20 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses20 {
    "200": N20019;
    "400": N40020;
    "401": N40120;
    "404": N40420;
    "409": N40920;
    "422": N42220;
    "500": N50020;
}

export interface N20019 {
    description: string;
    content: Content29;
}

export interface Content29 {
    "application/json": ApplicationJson29;
}

export interface ApplicationJson29 {
    schema: Schema46;
}

export interface Schema46 {
    $ref: string;
}

export interface N40020 {
    $ref: string;
}

export interface N40120 {
    $ref: string;
}

export interface N40420 {
    $ref: string;
}

export interface N40920 {
    $ref: string;
}

export interface N42220 {
    $ref: string;
}

export interface N50020 {
    $ref: string;
}

export interface StoreCollections {
    get: Get2;
}

export interface Get2 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses21;
}

export interface ExternalDocs28 {
    url: string;
    description: string;
}

export interface Parameter18 {
    name: string;
    in: string;
    description?: string;
    required: boolean;
    schema: Schema47;
}

export interface Schema47 {
    type?: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
    oneOf?: OneOf3[];
    properties?: Properties11;
    items?: Items20;
}

export interface ExternalDocs29 {
    url: string;
}

export interface OneOf3 {
    type: string;
    title?: string;
    description: string;
    items?: Items;
}

export interface Items {
    type: string;
    title: string;
    description: string;
}

export interface Properties11 {
    $and: And;
    $or: Or;
    $eq: Eq;
    $ne: Ne;
    $in: In;
    $nin: Nin;
    $not: Not;
    $gt: Gt2;
    $gte: Gte2;
    $lt: Lt2;
    $lte: Lte2;
    $like: Like2;
    $re: Re2;
    $ilike: Ilike2;
    $fulltext: Fulltext2;
    $overlap: Overlap2;
    $contains: Contains2;
    $contained: Contained2;
    $exists: Exists2;
}

export interface And {
    type: string;
    description: string;
    items: Items2;
    title: string;
}

export interface Items2 {
    type: string;
}

export interface Or {
    type: string;
    description: string;
    items: Items3;
    title: string;
}

export interface Items3 {
    type: string;
}

export interface Eq {
    oneOf: OneOf4[];
}

export interface OneOf4 {
    type: string;
    title?: string;
    description: string;
    items?: Items4;
}

export interface Items4 {
    type: string;
    title: string;
    description: string;
}

export interface Ne {
    type: string;
    title: string;
    description: string;
}

export interface In {
    type: string;
    description: string;
    items: Items5;
}

export interface Items5 {
    type: string;
    title: string;
    description: string;
}

export interface Nin {
    type: string;
    description: string;
    items: Items6;
}

export interface Items6 {
    type: string;
    title: string;
    description: string;
}

export interface Not {
    oneOf: OneOf5[];
}

export interface OneOf5 {
    type: string;
    title?: string;
    description: string;
    properties?: Properties12;
    items?: Items16;
}

export interface Properties12 {
    $and: And2;
    $or: Or2;
    $eq: Eq2;
    $ne: Ne2;
    $in: In2;
    $nin: Nin2;
    $not: Not2;
    $gt: Gt;
    $gte: Gte;
    $lt: Lt;
    $lte: Lte;
    $like: Like;
    $re: Re;
    $ilike: Ilike;
    $fulltext: Fulltext;
    $overlap: Overlap;
    $contains: Contains;
    $contained: Contained;
    $exists: Exists;
}

export interface And2 {
    type: string;
    description: string;
    items: Items7;
    title: string;
}

export interface Items7 {
    type: string;
}

export interface Or2 {
    type: string;
    description: string;
    items: Items8;
    title: string;
}

export interface Items8 {
    type: string;
}

export interface Eq2 {
    oneOf: OneOf6[];
}

export interface OneOf6 {
    type: string;
    title?: string;
    description: string;
    items?: Items9;
}

export interface Items9 {
    type: string;
    title: string;
    description: string;
}

export interface Ne2 {
    type: string;
    title: string;
    description: string;
}

export interface In2 {
    type: string;
    description: string;
    items: Items10;
}

export interface Items10 {
    type: string;
    title: string;
    description: string;
}

export interface Nin2 {
    type: string;
    description: string;
    items: Items11;
}

export interface Items11 {
    type: string;
    title: string;
    description: string;
}

export interface Not2 {
    oneOf: OneOf7[];
}

export interface OneOf7 {
    type: string;
    title?: string;
    description: string;
    items?: Items12;
}

export interface Items12 {
    type: string;
    title: string;
    description: string;
}

export interface Gt {
    type: string;
    title: string;
    description: string;
}

export interface Gte {
    type: string;
    title: string;
    description: string;
}

export interface Lt {
    type: string;
    title: string;
    description: string;
}

export interface Lte {
    type: string;
    title: string;
    description: string;
}

export interface Like {
    type: string;
    title: string;
    description: string;
}

export interface Re {
    type: string;
    title: string;
    description: string;
}

export interface Ilike {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext {
    type: string;
    title: string;
    description: string;
}

export interface Overlap {
    type: string;
    description: string;
    items: Items13;
}

export interface Items13 {
    type: string;
    title: string;
    description: string;
}

export interface Contains {
    type: string;
    description: string;
    items: Items14;
}

export interface Items14 {
    type: string;
    title: string;
    description: string;
}

export interface Contained {
    type: string;
    description: string;
    items: Items15;
}

export interface Items15 {
    type: string;
    title: string;
    description: string;
}

export interface Exists {
    type: string;
    title: string;
    description: string;
}

export interface Items16 {
    type: string;
    title: string;
    description: string;
}

export interface Gt2 {
    type: string;
    title: string;
    description: string;
}

export interface Gte2 {
    type: string;
    title: string;
    description: string;
}

export interface Lt2 {
    type: string;
    title: string;
    description: string;
}

export interface Lte2 {
    type: string;
    title: string;
    description: string;
}

export interface Like2 {
    type: string;
    title: string;
    description: string;
}

export interface Re2 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike2 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext2 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap2 {
    type: string;
    description: string;
    items: Items17;
}

export interface Items17 {
    type: string;
    title: string;
    description: string;
}

export interface Contains2 {
    type: string;
    description: string;
    items: Items18;
}

export interface Items18 {
    type: string;
    title: string;
    description: string;
}

export interface Contained2 {
    type: string;
    description: string;
    items: Items19;
}

export interface Items19 {
    type: string;
    title: string;
    description: string;
}

export interface Exists2 {
    type: string;
    title: string;
    description: string;
}

export interface Items20 {
    type: string;
}

export interface CodeSample21 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses21 {
    "200": N20020;
    "400": N40021;
    "401": N40121;
    "404": N40421;
    "409": N40921;
    "422": N42221;
    "500": N50021;
}

export interface N20020 {
    description: string;
    content: Content30;
}

export interface Content30 {
    "application/json": ApplicationJson30;
}

export interface ApplicationJson30 {
    schema: Schema48;
}

export interface Schema48 {
    allOf: AllOf4[];
}

export interface AllOf4 {
    type: string;
    description: string;
    required: string[];
    properties: Properties13;
}

export interface Properties13 {
    limit?: Limit;
    offset?: Offset;
    count?: Count;
    collections?: Collections;
}

export interface Limit {
    type: string;
    title: string;
    description: string;
}

export interface Offset {
    type: string;
    title: string;
    description: string;
}

export interface Count {
    type: string;
    title: string;
    description: string;
}

export interface Collections {
    type: string;
    description: string;
    items: Items21;
}

export interface Items21 {
    $ref: string;
}

export interface N40021 {
    $ref: string;
}

export interface N40121 {
    $ref: string;
}

export interface N40421 {
    $ref: string;
}

export interface N40921 {
    $ref: string;
}

export interface N42221 {
    $ref: string;
}

export interface N50021 {
    $ref: string;
}

export interface StoreCollectionsId {
    get: Get3;
}

export interface Get3 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses22;
}

export interface ExternalDocs30 {
    url: string;
    description: string;
}

export interface Parameter19 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema49;
}

export interface Schema49 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs31 {
    url: string;
}

export interface CodeSample22 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses22 {
    "200": N20021;
    "400": N40022;
    "401": N40122;
    "404": N40422;
    "409": N40922;
    "422": N42222;
    "500": N50022;
}

export interface N20021 {
    description: string;
    content: Content31;
}

export interface Content31 {
    "application/json": ApplicationJson31;
}

export interface ApplicationJson31 {
    schema: Schema50;
}

export interface Schema50 {
    $ref: string;
}

export interface N40022 {
    $ref: string;
}

export interface N40122 {
    $ref: string;
}

export interface N40422 {
    $ref: string;
}

export interface N40922 {
    $ref: string;
}

export interface N42222 {
    $ref: string;
}

export interface N50022 {
    $ref: string;
}

export interface StoreCurrencies {
    get: Get4;
}

export interface Get4 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses23;
}

export interface Parameter20 {
    name: string;
    in: string;
    description?: string;
    required: boolean;
    schema: Schema51;
}

export interface Schema51 {
    type?: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
    oneOf?: OneOf8[];
    items?: Items23;
}

export interface ExternalDocs32 {
    url: string;
}

export interface OneOf8 {
    type: string;
    title?: string;
    description: string;
    items?: Items22;
}

export interface Items22 {
    type: string;
    title: string;
    description: string;
}

export interface Items23 {
    type: string;
}

export interface CodeSample23 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses23 {
    "200": N20022;
    "400": N40023;
    "401": N40123;
    "404": N40423;
    "409": N40923;
    "422": N42223;
    "500": N50023;
}

export interface N20022 {
    description: string;
    content: Content32;
}

export interface Content32 {
    "application/json": ApplicationJson32;
}

export interface ApplicationJson32 {
    schema: Schema52;
}

export interface Schema52 {
    $ref: string;
}

export interface N40023 {
    $ref: string;
}

export interface N40123 {
    $ref: string;
}

export interface N40423 {
    $ref: string;
}

export interface N40923 {
    $ref: string;
}

export interface N42223 {
    $ref: string;
}

export interface N50023 {
    $ref: string;
}

export interface StoreCurrenciesCode {
    get: Get5;
}

export interface Get5 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses24;
}

export interface Parameter21 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema53;
}

export interface Schema53 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs33 {
    url: string;
}

export interface CodeSample24 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses24 {
    "200": N20023;
    "400": N40024;
    "401": N40124;
    "404": N40424;
    "409": N40924;
    "422": N42224;
    "500": N50024;
}

export interface N20023 {
    description: string;
    content: Content33;
}

export interface Content33 {
    "application/json": ApplicationJson33;
}

export interface ApplicationJson33 {
    schema: Schema54;
}

export interface Schema54 {
    $ref: string;
}

export interface N40024 {
    $ref: string;
}

export interface N40124 {
    $ref: string;
}

export interface N40424 {
    $ref: string;
}

export interface N40924 {
    $ref: string;
}

export interface N42224 {
    $ref: string;
}

export interface N50024 {
    $ref: string;
}

export interface StoreCustomers {
    post: Post17;
}

export interface Post17 {
    "operationId": string;
    "summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody11;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses25;
    "x-workflow": string;
    "security": Security2[];
}

export interface ExternalDocs34 {
    url: string;
    description: string;
}

export interface Parameter22 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema55;
}

export interface Schema55 {
    type: string;
    externalDocs: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs35 {
    url: string;
}

export interface RequestBody11 {
    content: Content34;
}

export interface Content34 {
    "application/json": ApplicationJson34;
}

export interface ApplicationJson34 {
    schema: Schema56;
}

export interface Schema56 {
    $ref: string;
}

export interface CodeSample25 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses25 {
    "200": N20024;
    "400": N40025;
    "401": N40125;
    "404": N40425;
    "409": N40925;
    "422": N42225;
    "500": N50025;
}

export interface N20024 {
    description: string;
    content: Content35;
}

export interface Content35 {
    "application/json": ApplicationJson35;
}

export interface ApplicationJson35 {
    schema: Schema57;
}

export interface Schema57 {
    $ref: string;
}

export interface N40025 {
    $ref: string;
}

export interface N40125 {
    $ref: string;
}

export interface N40425 {
    $ref: string;
}

export interface N40925 {
    $ref: string;
}

export interface N42225 {
    $ref: string;
}

export interface N50025 {
    $ref: string;
}

export interface Security2 {
    cookie_auth?: any[];
    jwt_token?: any[];
}

export interface StoreCustomersMe {
    get: Get6;
    post: Post18;
}

export interface Get6 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "x-authenticated": boolean;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "security": Security3[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses26;
}

export interface ExternalDocs36 {
    url: string;
    description: string;
}

export interface Parameter23 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema58;
}

export interface Schema58 {
    type: string;
    externalDocs: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs37 {
    url: string;
}

export interface Security3 {
    cookie_auth?: any[];
    jwt_token?: any[];
}

export interface CodeSample26 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses26 {
    "200": N20025;
    "400": N40026;
    "401": N40126;
    "404": N40426;
    "409": N40926;
    "422": N42226;
    "500": N50026;
}

export interface N20025 {
    description: string;
    content: Content36;
}

export interface Content36 {
    "application/json": ApplicationJson36;
}

export interface ApplicationJson36 {
    schema: Schema59;
}

export interface Schema59 {
    $ref: string;
}

export interface N40026 {
    $ref: string;
}

export interface N40126 {
    $ref: string;
}

export interface N40426 {
    $ref: string;
}

export interface N40926 {
    $ref: string;
}

export interface N42226 {
    $ref: string;
}

export interface N50026 {
    $ref: string;
}

export interface Post18 {
    "operationId": string;
    "summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "security": Security4[];
    "requestBody": RequestBody12;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses27;
    "x-workflow": string;
}

export interface ExternalDocs38 {
    url: string;
    description: string;
}

export interface Parameter24 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema60;
}

export interface Schema60 {
    type: string;
    externalDocs: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs39 {
    url: string;
}

export interface Security4 {
    cookie_auth?: any[];
    jwt_token?: any[];
}

export interface RequestBody12 {
    content: Content37;
}

export interface Content37 {
    "application/json": ApplicationJson37;
}

export interface ApplicationJson37 {
    schema: Schema61;
}

export interface Schema61 {
    $ref: string;
}

export interface CodeSample27 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses27 {
    "200": N20026;
    "400": N40027;
    "401": N40127;
    "404": N40427;
    "409": N40927;
    "422": N42227;
    "500": N50027;
}

export interface N20026 {
    description: string;
    content: Content38;
}

export interface Content38 {
    "application/json": ApplicationJson38;
}

export interface ApplicationJson38 {
    schema: Schema62;
}

export interface Schema62 {
    $ref: string;
}

export interface N40027 {
    $ref: string;
}

export interface N40127 {
    $ref: string;
}

export interface N40427 {
    $ref: string;
}

export interface N40927 {
    $ref: string;
}

export interface N42227 {
    $ref: string;
}

export interface N50027 {
    $ref: string;
}

export interface StoreCustomersMeAddresses {
    get: Get7;
    post: Post19;
}

export interface Get7 {
    "operationId": string;
    "summary": string;
    "x-sidebary-summary": string;
    "description": string;
    "x-authenticated": boolean;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "security": Security5[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses28;
}

export interface ExternalDocs40 {
    url: string;
    description: string;
}

export interface Parameter25 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema63;
}

export interface Schema63 {
    type?: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
    oneOf?: OneOf9[];
}

export interface ExternalDocs41 {
    url: string;
}

export interface OneOf9 {
    type: string;
    title?: string;
    description: string;
    items?: Items24;
}

export interface Items24 {
    type: string;
    title: string;
    description: string;
}

export interface Security5 {
    cookie_auth?: any[];
    jwt_token?: any[];
}

export interface CodeSample28 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses28 {
    "200": N20027;
    "400": N40028;
    "401": N40128;
    "404": N40428;
    "409": N40928;
    "422": N42228;
    "500": N50028;
}

export interface N20027 {
    description: string;
    content: Content39;
}

export interface Content39 {
    "application/json": ApplicationJson39;
}

export interface ApplicationJson39 {
    schema: Schema64;
}

export interface Schema64 {
    $ref: string;
}

export interface N40028 {
    $ref: string;
}

export interface N40128 {
    $ref: string;
}

export interface N40428 {
    $ref: string;
}

export interface N40928 {
    $ref: string;
}

export interface N42228 {
    $ref: string;
}

export interface N50028 {
    $ref: string;
}

export interface Post19 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "security": Security6[];
    "requestBody": RequestBody13;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses29;
    "x-workflow": string;
}

export interface ExternalDocs42 {
    url: string;
    description: string;
}

export interface Parameter26 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema65;
}

export interface Schema65 {
    type: string;
    externalDocs: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs43 {
    url: string;
}

export interface Security6 {
    cookie_auth?: any[];
    jwt_token?: any[];
}

export interface RequestBody13 {
    content: Content40;
}

export interface Content40 {
    "application/json": ApplicationJson40;
}

export interface ApplicationJson40 {
    schema: Schema66;
}

export interface Schema66 {
    type: string;
    description: string;
    properties: Properties14;
}

export interface Properties14 {
    first_name: FirstName;
    last_name: LastName;
    phone: Phone;
    company: Company;
    address_1: Address1;
    address_2: Address2;
    city: City;
    country_code: CountryCode;
    province: Province;
    postal_code: PostalCode;
    address_name: AddressName;
    is_default_shipping: IsDefaultShipping;
    is_default_billing: IsDefaultBilling;
    metadata: Metadata;
}

export interface FirstName {
    type: string;
    title: string;
    description: string;
}

export interface LastName {
    type: string;
    title: string;
    description: string;
}

export interface Phone {
    type: string;
    title: string;
    description: string;
}

export interface Company {
    type: string;
    title: string;
    description: string;
}

export interface Address1 {
    type: string;
    title: string;
    description: string;
}

export interface Address2 {
    type: string;
    title: string;
    description: string;
}

export interface City {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode {
    type: string;
    title: string;
    description: string;
}

export interface Province {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode {
    type: string;
    title: string;
    description: string;
}

export interface AddressName {
    type: string;
    title: string;
    description: string;
}

export interface IsDefaultShipping {
    type: string;
    title: string;
    description: string;
}

export interface IsDefaultBilling {
    type: string;
    title: string;
    description: string;
}

export interface Metadata {
    type: string;
    description: string;
}

export interface CodeSample29 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses29 {
    "200": N20028;
    "400": N40029;
    "401": N40129;
    "404": N40429;
    "409": N40929;
    "422": N42229;
    "500": N50029;
}

export interface N20028 {
    description: string;
    content: Content41;
}

export interface Content41 {
    "application/json": ApplicationJson41;
}

export interface ApplicationJson41 {
    schema: Schema67;
}

export interface Schema67 {
    $ref: string;
}

export interface N40029 {
    $ref: string;
}

export interface N40129 {
    $ref: string;
}

export interface N40429 {
    $ref: string;
}

export interface N40929 {
    $ref: string;
}

export interface N42229 {
    $ref: string;
}

export interface N50029 {
    $ref: string;
}

export interface StoreCustomersMeAddressesAddressId {
    get: Get8;
    post: Post20;
    delete: Delete4;
}

export interface Get8 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "security": Security7[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses30;
}

export interface Parameter27 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema68;
}

export interface Schema68 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs44 {
    url: string;
}

export interface Security7 {
    cookie_auth?: any[];
    jwt_token?: any[];
}

export interface CodeSample30 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses30 {
    "200": N20029;
    "400": N40030;
    "401": N40130;
    "404": N40430;
    "409": N40930;
    "422": N42230;
    "500": N50030;
}

export interface N20029 {
    description: string;
    content: Content42;
}

export interface Content42 {
    "application/json": ApplicationJson42;
}

export interface ApplicationJson42 {
    schema: Schema69;
}

export interface Schema69 {
    $ref: string;
}

export interface N40030 {
    $ref: string;
}

export interface N40130 {
    $ref: string;
}

export interface N40430 {
    $ref: string;
}

export interface N40930 {
    $ref: string;
}

export interface N42230 {
    $ref: string;
}

export interface N50030 {
    $ref: string;
}

export interface Post20 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "security": Security8[];
    "requestBody": RequestBody14;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses31;
    "x-workflow": string;
}

export interface ExternalDocs45 {
    url: string;
    description: string;
}

export interface Parameter28 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema70;
}

export interface Schema70 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs46 {
    url: string;
}

export interface Security8 {
    cookie_auth?: any[];
    jwt_token?: any[];
}

export interface RequestBody14 {
    content: Content43;
}

export interface Content43 {
    "application/json": ApplicationJson43;
}

export interface ApplicationJson43 {
    schema: Schema71;
}

export interface Schema71 {
    type: string;
    description: string;
    properties: Properties15;
}

export interface Properties15 {
    first_name: FirstName2;
    last_name: LastName2;
    phone: Phone2;
    company: Company2;
    address_1: Address12;
    address_2: Address22;
    city: City2;
    country_code: CountryCode2;
    province: Province2;
    postal_code: PostalCode2;
    address_name: AddressName2;
    is_default_shipping: IsDefaultShipping2;
    is_default_billing: IsDefaultBilling2;
    metadata: Metadata2;
}

export interface FirstName2 {
    type: string;
    title: string;
    description: string;
}

export interface LastName2 {
    type: string;
    title: string;
    description: string;
}

export interface Phone2 {
    type: string;
    title: string;
    description: string;
}

export interface Company2 {
    type: string;
    title: string;
    description: string;
}

export interface Address12 {
    type: string;
    title: string;
    description: string;
}

export interface Address22 {
    type: string;
    title: string;
    description: string;
}

export interface City2 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode2 {
    type: string;
    title: string;
    description: string;
}

export interface Province2 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode2 {
    type: string;
    title: string;
    description: string;
}

export interface AddressName2 {
    type: string;
    title: string;
    description: string;
}

export interface IsDefaultShipping2 {
    type: string;
    title: string;
    description: string;
}

export interface IsDefaultBilling2 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata2 {
    type: string;
    description: string;
}

export interface CodeSample31 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses31 {
    "200": N20030;
    "400": N40031;
    "401": N40131;
    "404": N40431;
    "409": N40931;
    "422": N42231;
    "500": N50031;
}

export interface N20030 {
    description: string;
    content: Content44;
}

export interface Content44 {
    "application/json": ApplicationJson44;
}

export interface ApplicationJson44 {
    schema: Schema72;
}

export interface Schema72 {
    $ref: string;
}

export interface N40031 {
    $ref: string;
}

export interface N40131 {
    $ref: string;
}

export interface N40431 {
    $ref: string;
}

export interface N40931 {
    $ref: string;
}

export interface N42231 {
    $ref: string;
}

export interface N50031 {
    $ref: string;
}

export interface Delete4 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "x-authenticated": boolean;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "security": Security9[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses32;
    "x-workflow": string;
}

export interface ExternalDocs47 {
    url: string;
    description: string;
}

export interface Parameter29 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema73;
}

export interface Schema73 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs48 {
    url: string;
}

export interface Security9 {
    cookie_auth?: any[];
    jwt_token?: any[];
}

export interface CodeSample32 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses32 {
    "200": N20031;
    "400": N40032;
    "401": N40132;
    "404": N40432;
    "409": N40932;
    "422": N42232;
    "500": N50032;
}

export interface N20031 {
    description: string;
    content: Content45;
}

export interface Content45 {
    "application/json": ApplicationJson45;
}

export interface ApplicationJson45 {
    schema: Schema74;
}

export interface Schema74 {
    allOf: AllOf5[];
    description: string;
}

export interface AllOf5 {
    type: string;
    description: string;
    required?: string[];
    properties: Properties16;
}

export interface Properties16 {
    id?: Id2;
    object?: Object2;
    deleted?: Deleted2;
    parent?: Parent2;
}

export interface Id2 {
    type: string;
    title: string;
    description: string;
}

export interface Object2 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted2 {
    type: string;
    title: string;
    description: string;
}

export interface Parent2 {
    $ref: string;
    description: string;
}

export interface N40032 {
    $ref: string;
}

export interface N40132 {
    $ref: string;
}

export interface N40432 {
    $ref: string;
}

export interface N40932 {
    $ref: string;
}

export interface N42232 {
    $ref: string;
}

export interface N50032 {
    $ref: string;
}

export interface StoreOrders {
    get: Get9;
}

export interface Get9 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses33;
    "security": Security10[];
    "x-workflow": string;
}

export interface Parameter30 {
    name: string;
    in: string;
    description?: string;
    required: boolean;
    schema: Schema75;
}

export interface Schema75 {
    type?: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
    oneOf?: OneOf10[];
    items?: Items26;
}

export interface ExternalDocs49 {
    url: string;
}

export interface OneOf10 {
    type: string;
    title?: string;
    description: string;
    items?: Items25;
}

export interface Items25 {
    type: string;
    title?: string;
    description: string;
    enum?: string[];
}

export interface Items26 {
    type: string;
}

export interface CodeSample33 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses33 {
    "200": N20032;
    "400": N40033;
    "401": N40133;
    "404": N40433;
    "409": N40933;
    "422": N42233;
    "500": N50033;
}

export interface N20032 {
    description: string;
    content: Content46;
}

export interface Content46 {
    "application/json": ApplicationJson46;
}

export interface ApplicationJson46 {
    schema: Schema76;
}

export interface Schema76 {
    allOf: AllOf6[];
}

export interface AllOf6 {
    type: string;
    description: string;
    required: string[];
    properties: Properties17;
}

export interface Properties17 {
    limit?: Limit2;
    offset?: Offset2;
    count?: Count2;
    orders?: Orders;
}

export interface Limit2 {
    type: string;
    title: string;
    description: string;
}

export interface Offset2 {
    type: string;
    title: string;
    description: string;
}

export interface Count2 {
    type: string;
    title: string;
    description: string;
}

export interface Orders {
    type: string;
    description: string;
    items: Items27;
}

export interface Items27 {
    $ref: string;
}

export interface N40033 {
    $ref: string;
}

export interface N40133 {
    $ref: string;
}

export interface N40433 {
    $ref: string;
}

export interface N40933 {
    $ref: string;
}

export interface N42233 {
    $ref: string;
}

export interface N50033 {
    $ref: string;
}

export interface Security10 {
    cookie_auth?: any[];
    jwt_token?: any[];
}

export interface StoreOrdersId {
    get: Get10;
}

export interface Get10 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses34;
    "x-workflow": string;
}

export interface Parameter31 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema77;
}

export interface Schema77 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs50 {
    url: string;
}

export interface CodeSample34 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses34 {
    "200": N20033;
    "400": N40034;
    "401": N40134;
    "404": N40434;
    "409": N40934;
    "422": N42234;
    "500": N50034;
}

export interface N20033 {
    description: string;
    content: Content47;
}

export interface Content47 {
    "application/json": ApplicationJson47;
}

export interface ApplicationJson47 {
    schema: Schema78;
}

export interface Schema78 {
    $ref: string;
}

export interface N40034 {
    $ref: string;
}

export interface N40134 {
    $ref: string;
}

export interface N40434 {
    $ref: string;
}

export interface N40934 {
    $ref: string;
}

export interface N42234 {
    $ref: string;
}

export interface N50034 {
    $ref: string;
}

export interface StoreOrdersIdTransferAccept {
    post: Post21;
}

export interface Post21 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody15;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses35;
    "x-workflow": string;
}

export interface Parameter32 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema79;
}

export interface Schema79 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs51 {
    url: string;
}

export interface RequestBody15 {
    content: Content48;
}

export interface Content48 {
    "application/json": ApplicationJson48;
}

export interface ApplicationJson48 {
    schema: Schema80;
}

export interface Schema80 {
    $ref: string;
}

export interface CodeSample35 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses35 {
    "200": N20034;
    "400": N40035;
    "401": N40135;
    "404": N40435;
    "409": N40935;
    "422": N42235;
    "500": N50035;
}

export interface N20034 {
    description: string;
    content: Content49;
}

export interface Content49 {
    "application/json": ApplicationJson49;
}

export interface ApplicationJson49 {
    schema: Schema81;
}

export interface Schema81 {
    $ref: string;
}

export interface N40035 {
    $ref: string;
}

export interface N40135 {
    $ref: string;
}

export interface N40435 {
    $ref: string;
}

export interface N40935 {
    $ref: string;
}

export interface N42235 {
    $ref: string;
}

export interface N50035 {
    $ref: string;
}

export interface StoreOrdersIdTransferCancel {
    post: Post22;
}

export interface Post22 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses36;
    "x-workflow": string;
    "security": Security11[];
}

export interface Parameter33 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema82;
}

export interface Schema82 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs52 {
    url: string;
}

export interface CodeSample36 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses36 {
    "200": N20035;
    "400": N40036;
    "401": N40136;
    "404": N40436;
    "409": N40936;
    "422": N42236;
    "500": N50036;
}

export interface N20035 {
    description: string;
    content: Content50;
}

export interface Content50 {
    "application/json": ApplicationJson50;
}

export interface ApplicationJson50 {
    schema: Schema83;
}

export interface Schema83 {
    $ref: string;
}

export interface N40036 {
    $ref: string;
}

export interface N40136 {
    $ref: string;
}

export interface N40436 {
    $ref: string;
}

export interface N40936 {
    $ref: string;
}

export interface N42236 {
    $ref: string;
}

export interface N50036 {
    $ref: string;
}

export interface Security11 {
    cookie_auth?: any[];
    jwt_token?: any[];
}

export interface StoreOrdersIdTransferDecline {
    post: Post23;
}

export interface Post23 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody16;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses37;
    "x-workflow": string;
}

export interface Parameter34 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema84;
}

export interface Schema84 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs53 {
    url: string;
}

export interface RequestBody16 {
    content: Content51;
}

export interface Content51 {
    "application/json": ApplicationJson51;
}

export interface ApplicationJson51 {
    schema: Schema85;
}

export interface Schema85 {
    $ref: string;
}

export interface CodeSample37 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses37 {
    "200": N20036;
    "400": N40037;
    "401": N40137;
    "404": N40437;
    "409": N40937;
    "422": N42237;
    "500": N50037;
}

export interface N20036 {
    description: string;
    content: Content52;
}

export interface Content52 {
    "application/json": ApplicationJson52;
}

export interface ApplicationJson52 {
    schema: Schema86;
}

export interface Schema86 {
    $ref: string;
}

export interface N40037 {
    $ref: string;
}

export interface N40137 {
    $ref: string;
}

export interface N40437 {
    $ref: string;
}

export interface N40937 {
    $ref: string;
}

export interface N42237 {
    $ref: string;
}

export interface N50037 {
    $ref: string;
}

export interface StoreOrdersIdTransferRequest {
    post: Post24;
}

export interface Post24 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summery": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody17;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses38;
    "x-workflow": string;
    "security": Security12[];
}

export interface Parameter35 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema87;
}

export interface Schema87 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs54 {
    url: string;
}

export interface RequestBody17 {
    content: Content53;
}

export interface Content53 {
    "application/json": ApplicationJson53;
}

export interface ApplicationJson53 {
    schema: Schema88;
}

export interface Schema88 {
    $ref: string;
}

export interface CodeSample38 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses38 {
    "200": N20037;
    "400": N40038;
    "401": N40138;
    "404": N40438;
    "409": N40938;
    "422": N42238;
    "500": N50038;
}

export interface N20037 {
    description: string;
    content: Content54;
}

export interface Content54 {
    "application/json": ApplicationJson54;
}

export interface ApplicationJson54 {
    schema: Schema89;
}

export interface Schema89 {
    $ref: string;
}

export interface N40038 {
    $ref: string;
}

export interface N40138 {
    $ref: string;
}

export interface N40438 {
    $ref: string;
}

export interface N40938 {
    $ref: string;
}

export interface N42238 {
    $ref: string;
}

export interface N50038 {
    $ref: string;
}

export interface Security12 {
    cookie_auth?: any[];
    jwt_token?: any[];
}

export interface StorePaymentCollections {
    post: Post25;
}

export interface Post25 {
    "operationId": string;
    "summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody18;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses39;
    "x-workflow": string;
}

export interface ExternalDocs55 {
    url: string;
    description: string;
}

export interface Parameter36 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema90;
}

export interface Schema90 {
    type: string;
    externalDocs: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs56 {
    url: string;
}

export interface RequestBody18 {
    content: Content55;
}

export interface Content55 {
    "application/json": ApplicationJson55;
}

export interface ApplicationJson55 {
    schema: Schema91;
}

export interface Schema91 {
    $ref: string;
}

export interface CodeSample39 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses39 {
    "200": N20038;
    "400": N40039;
    "401": N40139;
    "404": N40439;
    "409": N40939;
    "422": N42239;
    "500": N50039;
}

export interface N20038 {
    description: string;
    content: Content56;
}

export interface Content56 {
    "application/json": ApplicationJson56;
}

export interface ApplicationJson56 {
    schema: Schema92;
}

export interface Schema92 {
    $ref: string;
}

export interface N40039 {
    $ref: string;
}

export interface N40139 {
    $ref: string;
}

export interface N40439 {
    $ref: string;
}

export interface N40939 {
    $ref: string;
}

export interface N42239 {
    $ref: string;
}

export interface N50039 {
    $ref: string;
}

export interface StorePaymentCollectionsIdPaymentSessions {
    post: Post26;
}

export interface Post26 {
    "operationId": string;
    "summary": string;
    "x-sidebar-summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody19;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses40;
    "x-workflow": string;
}

export interface ExternalDocs57 {
    url: string;
    description: string;
}

export interface Parameter37 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema93;
}

export interface Schema93 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs58 {
    url: string;
}

export interface RequestBody19 {
    content: Content57;
}

export interface Content57 {
    "application/json": ApplicationJson57;
}

export interface ApplicationJson57 {
    schema: Schema94;
}

export interface Schema94 {
    $ref: string;
}

export interface CodeSample40 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses40 {
    "200": N20039;
    "400": N40040;
    "401": N40140;
    "404": N40440;
    "409": N40940;
    "422": N42240;
    "500": N50040;
}

export interface N20039 {
    description: string;
    content: Content58;
}

export interface Content58 {
    "application/json": ApplicationJson58;
}

export interface ApplicationJson58 {
    schema: Schema95;
}

export interface Schema95 {
    $ref: string;
}

export interface N40040 {
    $ref: string;
}

export interface N40140 {
    $ref: string;
}

export interface N40440 {
    $ref: string;
}

export interface N40940 {
    $ref: string;
}

export interface N42240 {
    $ref: string;
}

export interface N50040 {
    $ref: string;
}

export interface StorePaymentProviders {
    get: Get11;
}

export interface Get11 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses41;
}

export interface ExternalDocs59 {
    url: string;
    description: string;
}

export interface Parameter38 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema96;
}

export interface Schema96 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs60 {
    url: string;
}

export interface CodeSample41 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses41 {
    "200": N20040;
    "400": N40041;
    "401": N40141;
    "404": N40441;
    "409": N40941;
    "422": N42241;
    "500": N50041;
}

export interface N20040 {
    description: string;
    content: Content59;
}

export interface Content59 {
    "application/json": ApplicationJson59;
}

export interface ApplicationJson59 {
    schema: Schema97;
}

export interface Schema97 {
    allOf: AllOf7[];
}

export interface AllOf7 {
    type: string;
    description: string;
    required: string[];
    properties: Properties18;
}

export interface Properties18 {
    limit?: Limit3;
    offset?: Offset3;
    count?: Count3;
    payment_providers?: PaymentProviders;
}

export interface Limit3 {
    type: string;
    title: string;
    description: string;
}

export interface Offset3 {
    type: string;
    title: string;
    description: string;
}

export interface Count3 {
    type: string;
    title: string;
    description: string;
}

export interface PaymentProviders {
    type: string;
    description: string;
    items: Items28;
}

export interface Items28 {
    $ref: string;
}

export interface N40041 {
    $ref: string;
}

export interface N40141 {
    $ref: string;
}

export interface N40441 {
    $ref: string;
}

export interface N40941 {
    $ref: string;
}

export interface N42241 {
    $ref: string;
}

export interface N50041 {
    $ref: string;
}

export interface StoreProductCategories {
    get: Get12;
}

export interface Get12 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses42;
}

export interface ExternalDocs61 {
    url: string;
    description: string;
}

export interface Parameter39 {
    name: string;
    in: string;
    description?: string;
    required: boolean;
    schema: Schema98;
}

export interface Schema98 {
    type?: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
    oneOf?: OneOf11[];
    properties?: Properties19;
    items?: Items48;
}

export interface ExternalDocs62 {
    url: string;
}

export interface OneOf11 {
    type: string;
    title?: string;
    description: string;
    items?: Items29;
}

export interface Items29 {
    type: string;
    title: string;
    description: string;
}

export interface Properties19 {
    $and: And3;
    $or: Or3;
    $eq: Eq3;
    $ne: Ne3;
    $in: In3;
    $nin: Nin3;
    $not: Not3;
    $gt: Gt4;
    $gte: Gte4;
    $lt: Lt4;
    $lte: Lte4;
    $like: Like4;
    $re: Re4;
    $ilike: Ilike4;
    $fulltext: Fulltext4;
    $overlap: Overlap4;
    $contains: Contains4;
    $contained: Contained4;
    $exists: Exists4;
}

export interface And3 {
    type: string;
    description: string;
    items: Items30;
    title: string;
}

export interface Items30 {
    type: string;
}

export interface Or3 {
    type: string;
    description: string;
    items: Items31;
    title: string;
}

export interface Items31 {
    type: string;
}

export interface Eq3 {
    oneOf: OneOf12[];
}

export interface OneOf12 {
    type: string;
    title?: string;
    description: string;
    items?: Items32;
}

export interface Items32 {
    type: string;
    title: string;
    description: string;
}

export interface Ne3 {
    type: string;
    title: string;
    description: string;
}

export interface In3 {
    type: string;
    description: string;
    items: Items33;
}

export interface Items33 {
    type: string;
    title: string;
    description: string;
}

export interface Nin3 {
    type: string;
    description: string;
    items: Items34;
}

export interface Items34 {
    type: string;
    title: string;
    description: string;
}

export interface Not3 {
    oneOf: OneOf13[];
}

export interface OneOf13 {
    type: string;
    title?: string;
    description: string;
    properties?: Properties20;
    items?: Items44;
}

export interface Properties20 {
    $and: And4;
    $or: Or4;
    $eq: Eq4;
    $ne: Ne4;
    $in: In4;
    $nin: Nin4;
    $not: Not4;
    $gt: Gt3;
    $gte: Gte3;
    $lt: Lt3;
    $lte: Lte3;
    $like: Like3;
    $re: Re3;
    $ilike: Ilike3;
    $fulltext: Fulltext3;
    $overlap: Overlap3;
    $contains: Contains3;
    $contained: Contained3;
    $exists: Exists3;
}

export interface And4 {
    type: string;
    description: string;
    items: Items35;
    title: string;
}

export interface Items35 {
    type: string;
}

export interface Or4 {
    type: string;
    description: string;
    items: Items36;
    title: string;
}

export interface Items36 {
    type: string;
}

export interface Eq4 {
    oneOf: OneOf14[];
}

export interface OneOf14 {
    type: string;
    title?: string;
    description: string;
    items?: Items37;
}

export interface Items37 {
    type: string;
    title: string;
    description: string;
}

export interface Ne4 {
    type: string;
    title: string;
    description: string;
}

export interface In4 {
    type: string;
    description: string;
    items: Items38;
}

export interface Items38 {
    type: string;
    title: string;
    description: string;
}

export interface Nin4 {
    type: string;
    description: string;
    items: Items39;
}

export interface Items39 {
    type: string;
    title: string;
    description: string;
}

export interface Not4 {
    oneOf: OneOf15[];
}

export interface OneOf15 {
    type: string;
    title?: string;
    description: string;
    items?: Items40;
}

export interface Items40 {
    type: string;
    title: string;
    description: string;
}

export interface Gt3 {
    type: string;
    title: string;
    description: string;
}

export interface Gte3 {
    type: string;
    title: string;
    description: string;
}

export interface Lt3 {
    type: string;
    title: string;
    description: string;
}

export interface Lte3 {
    type: string;
    title: string;
    description: string;
}

export interface Like3 {
    type: string;
    title: string;
    description: string;
}

export interface Re3 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike3 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext3 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap3 {
    type: string;
    description: string;
    items: Items41;
}

export interface Items41 {
    type: string;
    title: string;
    description: string;
}

export interface Contains3 {
    type: string;
    description: string;
    items: Items42;
}

export interface Items42 {
    type: string;
    title: string;
    description: string;
}

export interface Contained3 {
    type: string;
    description: string;
    items: Items43;
}

export interface Items43 {
    type: string;
    title: string;
    description: string;
}

export interface Exists3 {
    type: string;
    title: string;
    description: string;
}

export interface Items44 {
    type: string;
    title: string;
    description: string;
}

export interface Gt4 {
    type: string;
    title: string;
    description: string;
}

export interface Gte4 {
    type: string;
    title: string;
    description: string;
}

export interface Lt4 {
    type: string;
    title: string;
    description: string;
}

export interface Lte4 {
    type: string;
    title: string;
    description: string;
}

export interface Like4 {
    type: string;
    title: string;
    description: string;
}

export interface Re4 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike4 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext4 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap4 {
    type: string;
    description: string;
    items: Items45;
}

export interface Items45 {
    type: string;
    title: string;
    description: string;
}

export interface Contains4 {
    type: string;
    description: string;
    items: Items46;
}

export interface Items46 {
    type: string;
    title: string;
    description: string;
}

export interface Contained4 {
    type: string;
    description: string;
    items: Items47;
}

export interface Items47 {
    type: string;
    title: string;
    description: string;
}

export interface Exists4 {
    type: string;
    title: string;
    description: string;
}

export interface Items48 {
    type: string;
}

export interface CodeSample42 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses42 {
    "200": N20041;
    "400": N40042;
    "401": N40142;
    "404": N40442;
    "409": N40942;
    "422": N42242;
    "500": N50042;
}

export interface N20041 {
    description: string;
    content: Content60;
}

export interface Content60 {
    "application/json": ApplicationJson60;
}

export interface ApplicationJson60 {
    schema: Schema99;
}

export interface Schema99 {
    $ref: string;
}

export interface N40042 {
    $ref: string;
}

export interface N40142 {
    $ref: string;
}

export interface N40442 {
    $ref: string;
}

export interface N40942 {
    $ref: string;
}

export interface N42242 {
    $ref: string;
}

export interface N50042 {
    $ref: string;
}

export interface StoreProductCategoriesId {
    get: Get13;
}

export interface Get13 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses43;
}

export interface ExternalDocs63 {
    url: string;
    description: string;
}

export interface Parameter40 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema100;
}

export interface Schema100 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs64 {
    url: string;
}

export interface CodeSample43 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses43 {
    "200": N20042;
    "400": N40043;
    "401": N40143;
    "404": N40443;
    "409": N40943;
    "422": N42243;
    "500": N50043;
}

export interface N20042 {
    description: string;
    content: Content61;
}

export interface Content61 {
    "application/json": ApplicationJson61;
}

export interface ApplicationJson61 {
    schema: Schema101;
}

export interface Schema101 {
    $ref: string;
}

export interface N40043 {
    $ref: string;
}

export interface N40143 {
    $ref: string;
}

export interface N40443 {
    $ref: string;
}

export interface N40943 {
    $ref: string;
}

export interface N42243 {
    $ref: string;
}

export interface N50043 {
    $ref: string;
}

export interface StoreProductTags {
    get: Get14;
}

export interface Get14 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses44;
}

export interface Parameter41 {
    name: string;
    in: string;
    description?: string;
    required: boolean;
    schema: Schema102;
}

export interface Schema102 {
    type?: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
    items?: Items49;
    oneOf?: OneOf16[];
    properties?: Properties21;
}

export interface ExternalDocs65 {
    url: string;
}

export interface Items49 {
    type: string;
}

export interface OneOf16 {
    type: string;
    title?: string;
    description: string;
    items?: Items50;
}

export interface Items50 {
    type: string;
    title: string;
    description: string;
}

export interface Properties21 {
    $and: And5;
    $or: Or5;
    $eq: Eq5;
    $ne: Ne5;
    $in: In5;
    $nin: Nin5;
    $not: Not5;
    $gt: Gt6;
    $gte: Gte6;
    $lt: Lt6;
    $lte: Lte6;
    $like: Like6;
    $re: Re6;
    $ilike: Ilike6;
    $fulltext: Fulltext6;
    $overlap: Overlap6;
    $contains: Contains6;
    $contained: Contained6;
    $exists: Exists6;
}

export interface And5 {
    type: string;
    description: string;
    items: Items51;
    title: string;
}

export interface Items51 {
    type: string;
}

export interface Or5 {
    type: string;
    description: string;
    items: Items52;
    title: string;
}

export interface Items52 {
    type: string;
}

export interface Eq5 {
    oneOf: OneOf17[];
}

export interface OneOf17 {
    type: string;
    title?: string;
    description: string;
    items?: Items53;
}

export interface Items53 {
    type: string;
    title: string;
    description: string;
}

export interface Ne5 {
    type: string;
    title: string;
    description: string;
}

export interface In5 {
    type: string;
    description: string;
    items: Items54;
}

export interface Items54 {
    type: string;
    title: string;
    description: string;
}

export interface Nin5 {
    type: string;
    description: string;
    items: Items55;
}

export interface Items55 {
    type: string;
    title: string;
    description: string;
}

export interface Not5 {
    oneOf: OneOf18[];
}

export interface OneOf18 {
    type: string;
    title?: string;
    description: string;
    properties?: Properties22;
    items?: Items65;
}

export interface Properties22 {
    $and: And6;
    $or: Or6;
    $eq: Eq6;
    $ne: Ne6;
    $in: In6;
    $nin: Nin6;
    $not: Not6;
    $gt: Gt5;
    $gte: Gte5;
    $lt: Lt5;
    $lte: Lte5;
    $like: Like5;
    $re: Re5;
    $ilike: Ilike5;
    $fulltext: Fulltext5;
    $overlap: Overlap5;
    $contains: Contains5;
    $contained: Contained5;
    $exists: Exists5;
}

export interface And6 {
    type: string;
    description: string;
    items: Items56;
    title: string;
}

export interface Items56 {
    type: string;
}

export interface Or6 {
    type: string;
    description: string;
    items: Items57;
    title: string;
}

export interface Items57 {
    type: string;
}

export interface Eq6 {
    oneOf: OneOf19[];
}

export interface OneOf19 {
    type: string;
    title?: string;
    description: string;
    items?: Items58;
}

export interface Items58 {
    type: string;
    title: string;
    description: string;
}

export interface Ne6 {
    type: string;
    title: string;
    description: string;
}

export interface In6 {
    type: string;
    description: string;
    items: Items59;
}

export interface Items59 {
    type: string;
    title: string;
    description: string;
}

export interface Nin6 {
    type: string;
    description: string;
    items: Items60;
}

export interface Items60 {
    type: string;
    title: string;
    description: string;
}

export interface Not6 {
    oneOf: OneOf20[];
}

export interface OneOf20 {
    type: string;
    title?: string;
    description: string;
    items?: Items61;
}

export interface Items61 {
    type: string;
    title: string;
    description: string;
}

export interface Gt5 {
    type: string;
    title: string;
    description: string;
}

export interface Gte5 {
    type: string;
    title: string;
    description: string;
}

export interface Lt5 {
    type: string;
    title: string;
    description: string;
}

export interface Lte5 {
    type: string;
    title: string;
    description: string;
}

export interface Like5 {
    type: string;
    title: string;
    description: string;
}

export interface Re5 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike5 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext5 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap5 {
    type: string;
    description: string;
    items: Items62;
}

export interface Items62 {
    type: string;
    title: string;
    description: string;
}

export interface Contains5 {
    type: string;
    description: string;
    items: Items63;
}

export interface Items63 {
    type: string;
    title: string;
    description: string;
}

export interface Contained5 {
    type: string;
    description: string;
    items: Items64;
}

export interface Items64 {
    type: string;
    title: string;
    description: string;
}

export interface Exists5 {
    type: string;
    title: string;
    description: string;
}

export interface Items65 {
    type: string;
    title: string;
    description: string;
}

export interface Gt6 {
    type: string;
    title: string;
    description: string;
}

export interface Gte6 {
    type: string;
    title: string;
    description: string;
}

export interface Lt6 {
    type: string;
    title: string;
    description: string;
}

export interface Lte6 {
    type: string;
    title: string;
    description: string;
}

export interface Like6 {
    type: string;
    title: string;
    description: string;
}

export interface Re6 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike6 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext6 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap6 {
    type: string;
    description: string;
    items: Items66;
}

export interface Items66 {
    type: string;
    title: string;
    description: string;
}

export interface Contains6 {
    type: string;
    description: string;
    items: Items67;
}

export interface Items67 {
    type: string;
    title: string;
    description: string;
}

export interface Contained6 {
    type: string;
    description: string;
    items: Items68;
}

export interface Items68 {
    type: string;
    title: string;
    description: string;
}

export interface Exists6 {
    type: string;
    title: string;
    description: string;
}

export interface CodeSample44 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses44 {
    "200": N20043;
    "400": N40044;
    "401": N40144;
    "404": N40444;
    "409": N40944;
    "422": N42244;
    "500": N50044;
}

export interface N20043 {
    description: string;
    content: Content62;
}

export interface Content62 {
    "application/json": ApplicationJson62;
}

export interface ApplicationJson62 {
    schema: Schema103;
}

export interface Schema103 {
    $ref: string;
}

export interface N40044 {
    $ref: string;
}

export interface N40144 {
    $ref: string;
}

export interface N40444 {
    $ref: string;
}

export interface N40944 {
    $ref: string;
}

export interface N42244 {
    $ref: string;
}

export interface N50044 {
    $ref: string;
}

export interface StoreProductTagsId {
    get: Get15;
}

export interface Get15 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses45;
}

export interface Parameter42 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema104;
}

export interface Schema104 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs66 {
    url: string;
}

export interface CodeSample45 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses45 {
    "200": N20044;
    "400": N40045;
    "401": N40145;
    "404": N40445;
    "409": N40945;
    "422": N42245;
    "500": N50045;
}

export interface N20044 {
    description: string;
    content: Content63;
}

export interface Content63 {
    "application/json": ApplicationJson63;
}

export interface ApplicationJson63 {
    schema: Schema105;
}

export interface Schema105 {
    $ref: string;
}

export interface N40045 {
    $ref: string;
}

export interface N40145 {
    $ref: string;
}

export interface N40445 {
    $ref: string;
}

export interface N40945 {
    $ref: string;
}

export interface N42245 {
    $ref: string;
}

export interface N50045 {
    $ref: string;
}

export interface StoreProductTypes {
    get: Get16;
}

export interface Get16 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses46;
}

export interface Parameter43 {
    name: string;
    in: string;
    description?: string;
    required: boolean;
    schema: Schema106;
}

export interface Schema106 {
    type?: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
    items?: Items69;
    oneOf?: OneOf21[];
    properties?: Properties23;
}

export interface ExternalDocs67 {
    url: string;
}

export interface Items69 {
    type: string;
}

export interface OneOf21 {
    type: string;
    title?: string;
    description: string;
    items?: Items70;
}

export interface Items70 {
    type: string;
    title: string;
    description: string;
}

export interface Properties23 {
    $and: And7;
    $or: Or7;
    $eq: Eq7;
    $ne: Ne7;
    $in: In7;
    $nin: Nin7;
    $not: Not7;
    $gt: Gt8;
    $gte: Gte8;
    $lt: Lt8;
    $lte: Lte8;
    $like: Like8;
    $re: Re8;
    $ilike: Ilike8;
    $fulltext: Fulltext8;
    $overlap: Overlap8;
    $contains: Contains8;
    $contained: Contained8;
    $exists: Exists8;
}

export interface And7 {
    type: string;
    description: string;
    items: Items71;
    title: string;
}

export interface Items71 {
    type: string;
}

export interface Or7 {
    type: string;
    description: string;
    items: Items72;
    title: string;
}

export interface Items72 {
    type: string;
}

export interface Eq7 {
    oneOf: OneOf22[];
}

export interface OneOf22 {
    type: string;
    title?: string;
    description: string;
    items?: Items73;
}

export interface Items73 {
    type: string;
    title: string;
    description: string;
}

export interface Ne7 {
    type: string;
    title: string;
    description: string;
}

export interface In7 {
    type: string;
    description: string;
    items: Items74;
}

export interface Items74 {
    type: string;
    title: string;
    description: string;
}

export interface Nin7 {
    type: string;
    description: string;
    items: Items75;
}

export interface Items75 {
    type: string;
    title: string;
    description: string;
}

export interface Not7 {
    oneOf: OneOf23[];
}

export interface OneOf23 {
    type: string;
    title?: string;
    description: string;
    properties?: Properties24;
    items?: Items85;
}

export interface Properties24 {
    $and: And8;
    $or: Or8;
    $eq: Eq8;
    $ne: Ne8;
    $in: In8;
    $nin: Nin8;
    $not: Not8;
    $gt: Gt7;
    $gte: Gte7;
    $lt: Lt7;
    $lte: Lte7;
    $like: Like7;
    $re: Re7;
    $ilike: Ilike7;
    $fulltext: Fulltext7;
    $overlap: Overlap7;
    $contains: Contains7;
    $contained: Contained7;
    $exists: Exists7;
}

export interface And8 {
    type: string;
    description: string;
    items: Items76;
    title: string;
}

export interface Items76 {
    type: string;
}

export interface Or8 {
    type: string;
    description: string;
    items: Items77;
    title: string;
}

export interface Items77 {
    type: string;
}

export interface Eq8 {
    oneOf: OneOf24[];
}

export interface OneOf24 {
    type: string;
    title?: string;
    description: string;
    items?: Items78;
}

export interface Items78 {
    type: string;
    title: string;
    description: string;
}

export interface Ne8 {
    type: string;
    title: string;
    description: string;
}

export interface In8 {
    type: string;
    description: string;
    items: Items79;
}

export interface Items79 {
    type: string;
    title: string;
    description: string;
}

export interface Nin8 {
    type: string;
    description: string;
    items: Items80;
}

export interface Items80 {
    type: string;
    title: string;
    description: string;
}

export interface Not8 {
    oneOf: OneOf25[];
}

export interface OneOf25 {
    type: string;
    title?: string;
    description: string;
    items?: Items81;
}

export interface Items81 {
    type: string;
    title: string;
    description: string;
}

export interface Gt7 {
    type: string;
    title: string;
    description: string;
}

export interface Gte7 {
    type: string;
    title: string;
    description: string;
}

export interface Lt7 {
    type: string;
    title: string;
    description: string;
}

export interface Lte7 {
    type: string;
    title: string;
    description: string;
}

export interface Like7 {
    type: string;
    title: string;
    description: string;
}

export interface Re7 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike7 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext7 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap7 {
    type: string;
    description: string;
    items: Items82;
}

export interface Items82 {
    type: string;
    title: string;
    description: string;
}

export interface Contains7 {
    type: string;
    description: string;
    items: Items83;
}

export interface Items83 {
    type: string;
    title: string;
    description: string;
}

export interface Contained7 {
    type: string;
    description: string;
    items: Items84;
}

export interface Items84 {
    type: string;
    title: string;
    description: string;
}

export interface Exists7 {
    type: string;
    title: string;
    description: string;
}

export interface Items85 {
    type: string;
    title: string;
    description: string;
}

export interface Gt8 {
    type: string;
    title: string;
    description: string;
}

export interface Gte8 {
    type: string;
    title: string;
    description: string;
}

export interface Lt8 {
    type: string;
    title: string;
    description: string;
}

export interface Lte8 {
    type: string;
    title: string;
    description: string;
}

export interface Like8 {
    type: string;
    title: string;
    description: string;
}

export interface Re8 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike8 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext8 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap8 {
    type: string;
    description: string;
    items: Items86;
}

export interface Items86 {
    type: string;
    title: string;
    description: string;
}

export interface Contains8 {
    type: string;
    description: string;
    items: Items87;
}

export interface Items87 {
    type: string;
    title: string;
    description: string;
}

export interface Contained8 {
    type: string;
    description: string;
    items: Items88;
}

export interface Items88 {
    type: string;
    title: string;
    description: string;
}

export interface Exists8 {
    type: string;
    title: string;
    description: string;
}

export interface CodeSample46 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses46 {
    "200": N20045;
    "400": N40046;
    "401": N40146;
    "404": N40446;
    "409": N40946;
    "422": N42246;
    "500": N50046;
}

export interface N20045 {
    description: string;
    content: Content64;
}

export interface Content64 {
    "application/json": ApplicationJson64;
}

export interface ApplicationJson64 {
    schema: Schema107;
}

export interface Schema107 {
    $ref: string;
}

export interface N40046 {
    $ref: string;
}

export interface N40146 {
    $ref: string;
}

export interface N40446 {
    $ref: string;
}

export interface N40946 {
    $ref: string;
}

export interface N42246 {
    $ref: string;
}

export interface N50046 {
    $ref: string;
}

export interface StoreProductTypesId {
    get: Get17;
}

export interface Get17 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses47;
}

export interface Parameter44 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema108;
}

export interface Schema108 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs68 {
    url: string;
}

export interface CodeSample47 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses47 {
    "200": N20046;
    "400": N40047;
    "401": N40147;
    "404": N40447;
    "409": N40947;
    "422": N42247;
    "500": N50047;
}

export interface N20046 {
    description: string;
    content: Content65;
}

export interface Content65 {
    "application/json": ApplicationJson65;
}

export interface ApplicationJson65 {
    schema: Schema109;
}

export interface Schema109 {
    $ref: string;
}

export interface N40047 {
    $ref: string;
}

export interface N40147 {
    $ref: string;
}

export interface N40447 {
    $ref: string;
}

export interface N40947 {
    $ref: string;
}

export interface N42247 {
    $ref: string;
}

export interface N50047 {
    $ref: string;
}

export interface StoreProducts {
    get: Get18;
}

export interface Get18 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses48;
}

export interface ExternalDocs69 {
    url: string;
    description: string;
}

export interface Parameter45 {
    name: string;
    in: string;
    description?: string;
    required: boolean;
    schema: Schema110;
}

export interface Schema110 {
    "type"?: string;
    "externalDocs"?: ExternalDocs;
    "title"?: string;
    "description"?: string;
    "items"?: Items89;
    "oneOf"?: OneOf26[];
    "properties"?: Properties25;
    "x-schemaName"?: string;
}

export interface ExternalDocs70 {
    url: string;
    description?: string;
}

export interface Items89 {
    type: string;
    title?: string;
    description?: string;
}

export interface OneOf26 {
    type: string;
    title?: string;
    description: string;
    items?: Items90;
}

export interface Items90 {
    type: string;
    title: string;
    description: string;
}

export interface Properties25 {
    options?: Options;
    $and?: And9;
    $or?: Or9;
    $eq?: Eq9;
    $ne?: Ne9;
    $in?: In9;
    $nin?: Nin9;
    $not?: Not9;
    $gt?: Gt10;
    $gte?: Gte10;
    $lt?: Lt10;
    $lte?: Lte10;
    $like?: Like10;
    $re?: Re10;
    $ilike?: Ilike10;
    $fulltext?: Fulltext10;
    $overlap?: Overlap10;
    $contains?: Contains10;
    $contained?: Contained10;
    $exists?: Exists10;
}

export interface Options {
    type: string;
    description: string;
    required: string[];
    properties: Properties26;
}

export interface Properties26 {
    option_id: OptionId2;
    value: Value;
}

export interface OptionId2 {
    type: string;
    title: string;
    description: string;
}

export interface Value {
    type: string;
    title: string;
    description: string;
}

export interface And9 {
    type: string;
    description: string;
    items: Items91;
    title: string;
}

export interface Items91 {
    type: string;
}

export interface Or9 {
    type: string;
    description: string;
    items: Items92;
    title: string;
}

export interface Items92 {
    type: string;
}

export interface Eq9 {
    oneOf: OneOf27[];
}

export interface OneOf27 {
    type: string;
    title?: string;
    description: string;
    items?: Items93;
}

export interface Items93 {
    type: string;
    title: string;
    description: string;
}

export interface Ne9 {
    type: string;
    title: string;
    description: string;
}

export interface In9 {
    type: string;
    description: string;
    items: Items94;
}

export interface Items94 {
    type: string;
    title: string;
    description: string;
}

export interface Nin9 {
    type: string;
    description: string;
    items: Items95;
}

export interface Items95 {
    type: string;
    title: string;
    description: string;
}

export interface Not9 {
    oneOf: OneOf28[];
}

export interface OneOf28 {
    type: string;
    title?: string;
    description: string;
    properties?: Properties27;
    items?: Items105;
}

export interface Properties27 {
    $and: And10;
    $or: Or10;
    $eq: Eq10;
    $ne: Ne10;
    $in: In10;
    $nin: Nin10;
    $not: Not10;
    $gt: Gt9;
    $gte: Gte9;
    $lt: Lt9;
    $lte: Lte9;
    $like: Like9;
    $re: Re9;
    $ilike: Ilike9;
    $fulltext: Fulltext9;
    $overlap: Overlap9;
    $contains: Contains9;
    $contained: Contained9;
    $exists: Exists9;
}

export interface And10 {
    type: string;
    description: string;
    items: Items96;
    title: string;
}

export interface Items96 {
    type: string;
}

export interface Or10 {
    type: string;
    description: string;
    items: Items97;
    title: string;
}

export interface Items97 {
    type: string;
}

export interface Eq10 {
    oneOf: OneOf29[];
}

export interface OneOf29 {
    type: string;
    title?: string;
    description: string;
    items?: Items98;
}

export interface Items98 {
    type: string;
    title: string;
    description: string;
}

export interface Ne10 {
    type: string;
    title: string;
    description: string;
}

export interface In10 {
    type: string;
    description: string;
    items: Items99;
}

export interface Items99 {
    type: string;
    title: string;
    description: string;
}

export interface Nin10 {
    type: string;
    description: string;
    items: Items100;
}

export interface Items100 {
    type: string;
    title: string;
    description: string;
}

export interface Not10 {
    oneOf: OneOf30[];
}

export interface OneOf30 {
    type: string;
    title?: string;
    description: string;
    items?: Items101;
}

export interface Items101 {
    type: string;
    title: string;
    description: string;
}

export interface Gt9 {
    type: string;
    title: string;
    description: string;
}

export interface Gte9 {
    type: string;
    title: string;
    description: string;
}

export interface Lt9 {
    type: string;
    title: string;
    description: string;
}

export interface Lte9 {
    type: string;
    title: string;
    description: string;
}

export interface Like9 {
    type: string;
    title: string;
    description: string;
}

export interface Re9 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike9 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext9 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap9 {
    type: string;
    description: string;
    items: Items102;
}

export interface Items102 {
    type: string;
    title: string;
    description: string;
}

export interface Contains9 {
    type: string;
    description: string;
    items: Items103;
}

export interface Items103 {
    type: string;
    title: string;
    description: string;
}

export interface Contained9 {
    type: string;
    description: string;
    items: Items104;
}

export interface Items104 {
    type: string;
    title: string;
    description: string;
}

export interface Exists9 {
    type: string;
    title: string;
    description: string;
}

export interface Items105 {
    type: string;
    title: string;
    description: string;
}

export interface Gt10 {
    type: string;
    title: string;
    description: string;
}

export interface Gte10 {
    type: string;
    title: string;
    description: string;
}

export interface Lt10 {
    type: string;
    title: string;
    description: string;
}

export interface Lte10 {
    type: string;
    title: string;
    description: string;
}

export interface Like10 {
    type: string;
    title: string;
    description: string;
}

export interface Re10 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike10 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext10 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap10 {
    type: string;
    description: string;
    items: Items106;
}

export interface Items106 {
    type: string;
    title: string;
    description: string;
}

export interface Contains10 {
    type: string;
    description: string;
    items: Items107;
}

export interface Items107 {
    type: string;
    title: string;
    description: string;
}

export interface Contained10 {
    type: string;
    description: string;
    items: Items108;
}

export interface Items108 {
    type: string;
    title: string;
    description: string;
}

export interface Exists10 {
    type: string;
    title: string;
    description: string;
}

export interface CodeSample48 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses48 {
    "200": N20047;
    "400": N40048;
    "401": N40148;
    "404": N40448;
    "409": N40948;
    "422": N42248;
    "500": N50048;
}

export interface N20047 {
    description: string;
    content: Content66;
}

export interface Content66 {
    "application/json": ApplicationJson66;
}

export interface ApplicationJson66 {
    schema: Schema111;
}

export interface Schema111 {
    allOf: AllOf8[];
}

export interface AllOf8 {
    type: string;
    description: string;
    required: string[];
    properties: Properties28;
}

export interface Properties28 {
    limit?: Limit4;
    offset?: Offset4;
    count?: Count4;
    products?: Products;
}

export interface Limit4 {
    type: string;
    title: string;
    description: string;
}

export interface Offset4 {
    type: string;
    title: string;
    description: string;
}

export interface Count4 {
    type: string;
    title: string;
    description: string;
}

export interface Products {
    type: string;
    description: string;
    items: Items109;
}

export interface Items109 {
    type: string;
}

export interface N40048 {
    $ref: string;
}

export interface N40148 {
    $ref: string;
}

export interface N40448 {
    $ref: string;
}

export interface N40948 {
    $ref: string;
}

export interface N42248 {
    $ref: string;
}

export interface N50048 {
    $ref: string;
}

export interface StoreProductsId {
    get: Get19;
}

export interface Get19 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses49;
}

export interface ExternalDocs71 {
    url: string;
    description: string;
}

export interface Parameter46 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema112;
}

export interface Schema112 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs72 {
    url: string;
    description?: string;
}

export interface CodeSample49 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses49 {
    "200": N20048;
    "400": N40049;
    "401": N40149;
    "404": N40449;
    "409": N40949;
    "422": N42249;
    "500": N50049;
}

export interface N20048 {
    description: string;
    content: Content67;
}

export interface Content67 {
    "application/json": ApplicationJson67;
}

export interface ApplicationJson67 {
    schema: Schema113;
}

export interface Schema113 {
    $ref: string;
}

export interface N40049 {
    $ref: string;
}

export interface N40149 {
    $ref: string;
}

export interface N40449 {
    $ref: string;
}

export interface N40949 {
    $ref: string;
}

export interface N42249 {
    $ref: string;
}

export interface N50049 {
    $ref: string;
}

export interface StoreRegions {
    get: Get20;
}

export interface Get20 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "externalDocs": ExternalDocs;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses50;
}

export interface ExternalDocs73 {
    url: string;
    description: string;
}

export interface Parameter47 {
    name: string;
    in: string;
    description?: string;
    required: boolean;
    schema: Schema114;
}

export interface Schema114 {
    type?: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
    oneOf?: OneOf31[];
    items?: Items111;
}

export interface ExternalDocs74 {
    url: string;
}

export interface OneOf31 {
    type: string;
    title?: string;
    description: string;
    items?: Items110;
}

export interface Items110 {
    type: string;
    title: string;
    description: string;
}

export interface Items111 {
    type: string;
}

export interface CodeSample50 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses50 {
    "200": N20049;
    "400": N40050;
    "401": N40150;
    "404": N40450;
    "409": N40950;
    "422": N42250;
    "500": N50050;
}

export interface N20049 {
    description: string;
    content: Content68;
}

export interface Content68 {
    "application/json": ApplicationJson68;
}

export interface ApplicationJson68 {
    schema: Schema115;
}

export interface Schema115 {
    allOf: AllOf9[];
}

export interface AllOf9 {
    type: string;
    description: string;
    required: string[];
    properties: Properties29;
}

export interface Properties29 {
    limit?: Limit5;
    offset?: Offset5;
    count?: Count5;
    regions?: Regions;
}

export interface Limit5 {
    type: string;
    title: string;
    description: string;
}

export interface Offset5 {
    type: string;
    title: string;
    description: string;
}

export interface Count5 {
    type: string;
    title: string;
    description: string;
}

export interface Regions {
    type: string;
    description: string;
    items: Items112;
}

export interface Items112 {
    $ref: string;
}

export interface N40050 {
    $ref: string;
}

export interface N40150 {
    $ref: string;
}

export interface N40450 {
    $ref: string;
}

export interface N40950 {
    $ref: string;
}

export interface N42250 {
    $ref: string;
}

export interface N50050 {
    $ref: string;
}

export interface StoreRegionsId {
    get: Get21;
}

export interface Get21 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses51;
}

export interface Parameter48 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema116;
}

export interface Schema116 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs75 {
    url: string;
}

export interface CodeSample51 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses51 {
    "200": N20050;
    "400": N40051;
    "401": N40151;
    "404": N40451;
    "409": N40951;
    "422": N42251;
    "500": N50051;
}

export interface N20050 {
    description: string;
    content: Content69;
}

export interface Content69 {
    "application/json": ApplicationJson69;
}

export interface ApplicationJson69 {
    schema: Schema117;
}

export interface Schema117 {
    type: string;
    description: string;
    required: string[];
    properties: Properties30;
}

export interface Properties30 {
    region: Region;
}

export interface Region {
    $ref: string;
}

export interface N40051 {
    $ref: string;
}

export interface N40151 {
    $ref: string;
}

export interface N40451 {
    $ref: string;
}

export interface N40951 {
    $ref: string;
}

export interface N42251 {
    $ref: string;
}

export interface N50051 {
    $ref: string;
}

export interface StoreReturn {
    post: Post27;
}

export interface Post27 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "requestBody": RequestBody20;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses52;
    "x-workflow": string;
    "parameters": Parameter[];
}

export interface RequestBody20 {
    content: Content70;
}

export interface Content70 {
    "application/json": ApplicationJson70;
}

export interface ApplicationJson70 {
    schema: Schema118;
}

export interface Schema118 {
    $ref: string;
}

export interface CodeSample52 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses52 {
    "200": N20051;
    "400": N40052;
    "401": N40152;
    "404": N40452;
    "409": N40952;
    "422": N42252;
    "500": N50052;
}

export interface N20051 {
    description: string;
    content: Content71;
}

export interface Content71 {
    "application/json": ApplicationJson71;
}

export interface ApplicationJson71 {
    schema: Schema119;
}

export interface Schema119 {
    $ref: string;
}

export interface N40052 {
    $ref: string;
}

export interface N40152 {
    $ref: string;
}

export interface N40452 {
    $ref: string;
}

export interface N40952 {
    $ref: string;
}

export interface N42252 {
    $ref: string;
}

export interface N50052 {
    $ref: string;
}

export interface Parameter49 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema120;
}

export interface Schema120 {
    type: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs76 {
    url: string;
}

export interface StoreReturnReasons {
    get: Get22;
}

export interface Get22 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses53;
}

export interface Parameter50 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema121;
}

export interface Schema121 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs77 {
    url: string;
}

export interface CodeSample53 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses53 {
    "200": N20052;
    "400": N40053;
    "401": N40153;
    "404": N40453;
    "409": N40953;
    "422": N42253;
    "500": N50053;
}

export interface N20052 {
    description: string;
    content: Content72;
}

export interface Content72 {
    "application/json": ApplicationJson72;
}

export interface ApplicationJson72 {
    schema: Schema122;
}

export interface Schema122 {
    allOf: AllOf10[];
}

export interface AllOf10 {
    type: string;
    description: string;
    required: string[];
    properties: Properties31;
}

export interface Properties31 {
    limit?: Limit6;
    offset?: Offset6;
    count?: Count6;
    return_reasons?: ReturnReasons;
}

export interface Limit6 {
    type: string;
    title: string;
    description: string;
}

export interface Offset6 {
    type: string;
    title: string;
    description: string;
}

export interface Count6 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnReasons {
    type: string;
    description: string;
    items: Items113;
}

export interface Items113 {
    $ref: string;
}

export interface N40053 {
    $ref: string;
}

export interface N40153 {
    $ref: string;
}

export interface N40453 {
    $ref: string;
}

export interface N40953 {
    $ref: string;
}

export interface N42253 {
    $ref: string;
}

export interface N50053 {
    $ref: string;
}

export interface StoreReturnReasonsId {
    get: Get23;
}

export interface Get23 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses54;
}

export interface Parameter51 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema123;
}

export interface Schema123 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs78 {
    url: string;
}

export interface CodeSample54 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses54 {
    "200": N20053;
    "400": N40054;
    "401": N40154;
    "404": N40454;
    "409": N40954;
    "422": N42254;
    "500": N50054;
}

export interface N20053 {
    description: string;
    content: Content73;
}

export interface Content73 {
    "application/json": ApplicationJson73;
}

export interface ApplicationJson73 {
    schema: Schema124;
}

export interface Schema124 {
    $ref: string;
}

export interface N40054 {
    $ref: string;
}

export interface N40154 {
    $ref: string;
}

export interface N40454 {
    $ref: string;
}

export interface N40954 {
    $ref: string;
}

export interface N42254 {
    $ref: string;
}

export interface N50054 {
    $ref: string;
}

export interface StoreShippingOptions {
    get: Get24;
}

export interface Get24 {
    "operationId": string;
    "summary": string;
    "description": string;
    "externalDocs": ExternalDocs;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses55;
    "x-workflow": string;
}

export interface ExternalDocs79 {
    url: string;
    description: string;
}

export interface Parameter52 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema125;
}

export interface Schema125 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
    items?: Items114;
}

export interface ExternalDocs80 {
    url: string;
}

export interface Items114 {
    type: string;
}

export interface CodeSample55 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses55 {
    "200": N20054;
    "400": N40055;
    "401": N40155;
    "404": N40455;
    "409": N40955;
    "422": N42255;
    "500": N50055;
}

export interface N20054 {
    description: string;
    content: Content74;
}

export interface Content74 {
    "application/json": ApplicationJson74;
}

export interface ApplicationJson74 {
    schema: Schema126;
}

export interface Schema126 {
    $ref: string;
}

export interface N40055 {
    $ref: string;
}

export interface N40155 {
    $ref: string;
}

export interface N40455 {
    $ref: string;
}

export interface N40955 {
    $ref: string;
}

export interface N42255 {
    $ref: string;
}

export interface N50055 {
    $ref: string;
}

export interface StoreShippingOptionsIdCalculate {
    post: Post28;
}

export interface Post28 {
    "operationId": string;
    "summary": string;
    "description": string;
    "x-authenticated": boolean;
    "parameters": Parameter[];
    "requestBody": RequestBody21;
    "x-codeSamples": CodeSample[];
    "tags": string[];
    "responses": Responses56;
    "x-workflow": string;
}

export interface Parameter53 {
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: Schema127;
}

export interface Schema127 {
    type: string;
    externalDocs?: ExternalDocs;
    title?: string;
    description?: string;
}

export interface ExternalDocs81 {
    url: string;
}

export interface RequestBody21 {
    content: Content75;
}

export interface Content75 {
    "application/json": ApplicationJson75;
}

export interface ApplicationJson75 {
    schema: Schema128;
}

export interface Schema128 {
    type: string;
    description: string;
    required: string[];
    properties: Properties32;
}

export interface Properties32 {
    cart_id: CartId;
    data: Data2;
}

export interface CartId {
    type: string;
    title: string;
    description: string;
}

export interface Data2 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs82 {
    url: string;
}

export interface CodeSample56 {
    lang: string;
    label: string;
    source: string;
}

export interface Responses56 {
    "200": N20055;
    "400": N40056;
    "401": N40156;
    "404": N40456;
    "409": N40956;
    "422": N42256;
    "500": N50056;
}

export interface N20055 {
    description: string;
    content: Content76;
}

export interface Content76 {
    "application/json": ApplicationJson76;
}

export interface ApplicationJson76 {
    schema: Schema129;
}

export interface Schema129 {
    $ref: string;
}

export interface N40056 {
    $ref: string;
}

export interface N40156 {
    $ref: string;
}

export interface N40456 {
    $ref: string;
}

export interface N40956 {
    $ref: string;
}

export interface N42256 {
    $ref: string;
}

export interface N50056 {
    $ref: string;
}

export interface Components {
    schemas: Schemas;
    responses: Responses57;
    examples: Examples3;
    securitySchemes: SecuritySchemes;
}

export interface Schemas {
    AdminApiKey: AdminApiKey;
    AdminApiKeyResponse: AdminApiKeyResponse;
    AdminApplicationMethod: AdminApplicationMethod;
    AdminBatchCreateInventoryItemsLocationLevels: AdminBatchCreateInventoryItemsLocationLevels;
    AdminBatchInventoryItemLocationsLevel: AdminBatchInventoryItemLocationsLevel;
    AdminBatchInventoryItemsLocationLevels: AdminBatchInventoryItemsLocationLevels;
    AdminBatchInventoryItemsLocationLevelsResponse: AdminBatchInventoryItemsLocationLevelsResponse;
    AdminBatchProductRequest: AdminBatchProductRequest;
    AdminBatchProductResponse: AdminBatchProductResponse;
    AdminBatchProductVariantRequest: AdminBatchProductVariantRequest;
    AdminBatchProductVariantResponse: AdminBatchProductVariantResponse;
    AdminBatchUpdateInventoryItemsLocationLevels: AdminBatchUpdateInventoryItemsLocationLevels;
    AdminBatchUpdateProduct: AdminBatchUpdateProduct;
    AdminBatchUpdateProductVariant: AdminBatchUpdateProductVariant;
    AdminCampaign: AdminCampaign;
    AdminCampaignResponse: AdminCampaignResponse;
    AdminClaim: AdminClaim;
    AdminClaimDeleteResponse: AdminClaimDeleteResponse;
    AdminClaimListResponse: AdminClaimListResponse;
    AdminClaimOrderResponse: AdminClaimOrderResponse;
    AdminClaimPreviewResponse: AdminClaimPreviewResponse;
    AdminClaimRequestResponse: AdminClaimRequestResponse;
    AdminClaimResponse: AdminClaimResponse;
    AdminClaimReturnPreviewResponse: AdminClaimReturnPreviewResponse;
    AdminCollection: AdminCollection;
    AdminCollectionDeleteResponse: AdminCollectionDeleteResponse;
    AdminCollectionListResponse: AdminCollectionListResponse;
    AdminCollectionResponse: AdminCollectionResponse;
    AdminCreateApiKey: AdminCreateApiKey;
    AdminCreateCollection: AdminCreateCollection;
    AdminCreateCustomerGroup: AdminCreateCustomerGroup;
    AdminCreateFulfillment: AdminCreateFulfillment;
    AdminCreateInventoryItem: AdminCreateInventoryItem;
    AdminCreatePriceList: AdminCreatePriceList;
    AdminCreatePricePreference: AdminCreatePricePreference;
    AdminCreateProduct: AdminCreateProduct;
    AdminCreateProductCategory: AdminCreateProductCategory;
    AdminCreateProductOption: AdminCreateProductOption;
    AdminCreateProductTag: AdminCreateProductTag;
    AdminCreateProductType: AdminCreateProductType;
    AdminCreateProductVariant: AdminCreateProductVariant;
    AdminCreateProductVariantInventoryKit: AdminCreateProductVariantInventoryKit;
    AdminCreateProductVariantPrice: AdminCreateProductVariantPrice;
    AdminCreatePromotionRule: AdminCreatePromotionRule;
    AdminCreateRefundReason: AdminCreateRefundReason;
    AdminCreateRegion: AdminCreateRegion;
    AdminCreateReservation: AdminCreateReservation;
    AdminCreateReturnReason: AdminCreateReturnReason;
    AdminCreateSalesChannel: AdminCreateSalesChannel;
    AdminCreateShipment: AdminCreateShipment;
    AdminCreateShippingOption: AdminCreateShippingOption;
    AdminCreateShippingOptionRule: AdminCreateShippingOptionRule;
    AdminCreateShippingOptionType: AdminCreateShippingOptionType;
    AdminCreateShippingProfile: AdminCreateShippingProfile;
    AdminCreateStockLocation: AdminCreateStockLocation;
    AdminCreateTaxRate: AdminCreateTaxRate;
    AdminCreateTaxRateRule: AdminCreateTaxRateRule;
    AdminCreateTaxRegion: AdminCreateTaxRegion;
    AdminCreateVariantInventoryItem: AdminCreateVariantInventoryItem;
    AdminCreateWorkflowsAsyncResponse: AdminCreateWorkflowsAsyncResponse;
    AdminCreateWorkflowsRun: AdminCreateWorkflowsRun;
    AdminCurrency: AdminCurrency;
    AdminCurrencyListResponse: AdminCurrencyListResponse;
    AdminCurrencyResponse: AdminCurrencyResponse;
    AdminCustomer: AdminCustomer;
    AdminCustomerAddress: AdminCustomerAddress;
    AdminCustomerAddressResponse: AdminCustomerAddressResponse;
    AdminCustomerGroup: AdminCustomerGroup;
    AdminCustomerGroupResponse: AdminCustomerGroupResponse;
    AdminCustomerInGroupFilters: AdminCustomerInGroupFilters;
    AdminCustomerResponse: AdminCustomerResponse;
    AdminDeletePaymentCollectionResponse: AdminDeletePaymentCollectionResponse;
    AdminDraftOrder: AdminDraftOrder;
    AdminDraftOrderListResponse: AdminDraftOrderListResponse;
    AdminDraftOrderResponse: AdminDraftOrderResponse;
    AdminExchange: AdminExchange;
    AdminExchangeDeleteResponse: AdminExchangeDeleteResponse;
    AdminExchangeOrderResponse: AdminExchangeOrderResponse;
    AdminExchangePreviewResponse: AdminExchangePreviewResponse;
    AdminExchangeRequestResponse: AdminExchangeRequestResponse;
    AdminExchangeResponse: AdminExchangeResponse;
    AdminExchangeReturnResponse: AdminExchangeReturnResponse;
    AdminExportProductResponse: AdminExportProductResponse;
    AdminFile: AdminFile;
    AdminFileListResponse: AdminFileListResponse;
    AdminFileResponse: AdminFileResponse;
    AdminFulfillment: AdminFulfillment;
    AdminFulfillmentAddress: AdminFulfillmentAddress;
    AdminFulfillmentItem: AdminFulfillmentItem;
    AdminFulfillmentLabel: AdminFulfillmentLabel;
    AdminFulfillmentProvider: AdminFulfillmentProvider;
    AdminFulfillmentProviderListResponse: AdminFulfillmentProviderListResponse;
    AdminFulfillmentProviderOption: AdminFulfillmentProviderOption;
    AdminFulfillmentProviderOptionsListResponse: AdminFulfillmentProviderOptionsListResponse;
    AdminFulfillmentResponse: AdminFulfillmentResponse;
    AdminFulfillmentSet: AdminFulfillmentSet;
    AdminFulfillmentSetDeleteResponse: AdminFulfillmentSetDeleteResponse;
    AdminFulfillmentSetResponse: AdminFulfillmentSetResponse;
    AdminGeoZone: AdminGeoZone;
    AdminImportProductRequest: AdminImportProductRequest;
    AdminImportProductResponse: AdminImportProductResponse;
    AdminInventoryItem: AdminInventoryItem;
    AdminInventoryItemResponse: AdminInventoryItemResponse;
    AdminInventoryLevel: AdminInventoryLevel;
    AdminInvite: AdminInvite;
    AdminInviteResponse: AdminInviteResponse;
    AdminLinkPriceListProducts: AdminLinkPriceListProducts;
    AdminNotification: AdminNotification;
    AdminNotificationListResponse: AdminNotificationListResponse;
    AdminNotificationResponse: AdminNotificationResponse;
    AdminOrder: AdminOrder;
    AdminOrderAddress: AdminOrderAddress;
    AdminOrderChange: AdminOrderChange;
    AdminOrderChangeAction: AdminOrderChangeAction;
    AdminOrderChangesResponse: AdminOrderChangesResponse;
    AdminOrderEditPreviewResponse: AdminOrderEditPreviewResponse;
    AdminOrderEditResponse: AdminOrderEditResponse;
    AdminOrderFulfillment: AdminOrderFulfillment;
    AdminOrderItem: AdminOrderItem;
    AdminOrderLineItem: AdminOrderLineItem;
    AdminOrderPreview: AdminOrderPreview;
    AdminOrderPreviewResponse: AdminOrderPreviewResponse;
    AdminOrderResponse: AdminOrderResponse;
    AdminOrderReturnResponse: AdminOrderReturnResponse;
    AdminOrderShippingMethod: AdminOrderShippingMethod;
    AdminPayment: AdminPayment;
    AdminPaymentCollection: AdminPaymentCollection;
    AdminPaymentCollectionResponse: AdminPaymentCollectionResponse;
    AdminPaymentProvider: AdminPaymentProvider;
    AdminPaymentResponse: AdminPaymentResponse;
    AdminPaymentSession: AdminPaymentSession;
    AdminPostCancelClaimReqSchema: AdminPostCancelClaimReqSchema;
    AdminPostCancelExchangeReqSchema: AdminPostCancelExchangeReqSchema;
    AdminPostCancelReturnReqSchema: AdminPostCancelReturnReqSchema;
    AdminPostClaimItemsReqSchema: AdminPostClaimItemsReqSchema;
    AdminPostClaimsAddItemsReqSchema: AdminPostClaimsAddItemsReqSchema;
    AdminPostClaimsItemsActionReqSchema: AdminPostClaimsItemsActionReqSchema;
    AdminPostClaimsShippingActionReqSchema: AdminPostClaimsShippingActionReqSchema;
    AdminPostClaimsShippingReqSchema: AdminPostClaimsShippingReqSchema;
    AdminPostExchangesAddItemsReqSchema: AdminPostExchangesAddItemsReqSchema;
    AdminPostExchangesItemsActionReqSchema: AdminPostExchangesItemsActionReqSchema;
    AdminPostExchangesRequestItemsReturnActionReqSchema: AdminPostExchangesRequestItemsReturnActionReqSchema;
    AdminPostExchangesReturnRequestItemsReqSchema: AdminPostExchangesReturnRequestItemsReqSchema;
    AdminPostExchangesShippingActionReqSchema: AdminPostExchangesShippingActionReqSchema;
    AdminPostExchangesShippingReqSchema: AdminPostExchangesShippingReqSchema;
    AdminPostOrderClaimsReqSchema: AdminPostOrderClaimsReqSchema;
    AdminPostOrderEditsAddItemsReqSchema: AdminPostOrderEditsAddItemsReqSchema;
    AdminPostOrderEditsItemsActionReqSchema: AdminPostOrderEditsItemsActionReqSchema;
    AdminPostOrderEditsReqSchema: AdminPostOrderEditsReqSchema;
    AdminPostOrderEditsShippingActionReqSchema: AdminPostOrderEditsShippingActionReqSchema;
    AdminPostOrderEditsShippingReqSchema: AdminPostOrderEditsShippingReqSchema;
    AdminPostOrderEditsUpdateItemQuantityReqSchema: AdminPostOrderEditsUpdateItemQuantityReqSchema;
    AdminPostOrderExchangesReqSchema: AdminPostOrderExchangesReqSchema;
    AdminPostReceiveReturnsReqSchema: AdminPostReceiveReturnsReqSchema;
    AdminPostReturnsConfirmRequestReqSchema: AdminPostReturnsConfirmRequestReqSchema;
    AdminPostReturnsDismissItemsActionReqSchema: AdminPostReturnsDismissItemsActionReqSchema;
    AdminPostReturnsReceiveItemsActionReqSchema: AdminPostReturnsReceiveItemsActionReqSchema;
    AdminPostReturnsReceiveItemsReqSchema: AdminPostReturnsReceiveItemsReqSchema;
    AdminPostReturnsReqSchema: AdminPostReturnsReqSchema;
    AdminPostReturnsRequestItemsActionReqSchema: AdminPostReturnsRequestItemsActionReqSchema;
    AdminPostReturnsRequestItemsReqSchema: AdminPostReturnsRequestItemsReqSchema;
    AdminPostReturnsReturnReqSchema: AdminPostReturnsReturnReqSchema;
    AdminPostReturnsShippingActionReqSchema: AdminPostReturnsShippingActionReqSchema;
    AdminPostReturnsShippingReqSchema: AdminPostReturnsShippingReqSchema;
    AdminPrice: AdminPrice;
    AdminPriceList: AdminPriceList;
    AdminPriceListBatchResponse: AdminPriceListBatchResponse;
    AdminPriceListDeleteResponse: AdminPriceListDeleteResponse;
    AdminPriceListListResponse: AdminPriceListListResponse;
    AdminPriceListPrice: AdminPriceListPrice;
    AdminPriceListResponse: AdminPriceListResponse;
    AdminPricePreference: AdminPricePreference;
    AdminPricePreferenceDeleteResponse: AdminPricePreferenceDeleteResponse;
    AdminPricePreferenceListResponse: AdminPricePreferenceListResponse;
    AdminPricePreferenceResponse: AdminPricePreferenceResponse;
    AdminProduct: AdminProduct;
    AdminProductCategory: AdminProductCategory;
    AdminProductCategoryDeleteResponse: AdminProductCategoryDeleteResponse;
    AdminProductCategoryListResponse: AdminProductCategoryListResponse;
    AdminProductCategoryResponse: AdminProductCategoryResponse;
    AdminProductDeleteResponse: AdminProductDeleteResponse;
    AdminProductImage: AdminProductImage;
    AdminProductOption: AdminProductOption;
    AdminProductOptionDeleteResponse: AdminProductOptionDeleteResponse;
    AdminProductOptionResponse: AdminProductOptionResponse;
    AdminProductOptionValue: AdminProductOptionValue;
    AdminProductResponse: AdminProductResponse;
    AdminProductTag: AdminProductTag;
    AdminProductTagDeleteResponse: AdminProductTagDeleteResponse;
    AdminProductTagListResponse: AdminProductTagListResponse;
    AdminProductTagResponse: AdminProductTagResponse;
    AdminProductType: AdminProductType;
    AdminProductTypeDeleteResponse: AdminProductTypeDeleteResponse;
    AdminProductTypeListResponse: AdminProductTypeListResponse;
    AdminProductTypeResponse: AdminProductTypeResponse;
    AdminProductVariant: AdminProductVariant;
    AdminProductVariantDeleteResponse: AdminProductVariantDeleteResponse;
    AdminProductVariantInventoryBatchResponse: AdminProductVariantInventoryBatchResponse;
    AdminProductVariantInventoryItemLink: AdminProductVariantInventoryItemLink;
    AdminProductVariantInventoryLink: AdminProductVariantInventoryLink;
    AdminProductVariantInventoryLinkDeleteResponse: AdminProductVariantInventoryLinkDeleteResponse;
    AdminProductVariantResponse: AdminProductVariantResponse;
    AdminPromotion: AdminPromotion;
    AdminPromotionResponse: AdminPromotionResponse;
    AdminPromotionRule: AdminPromotionRule;
    AdminRefund: AdminRefund;
    AdminRefundReason: AdminRefundReason;
    AdminRegion: AdminRegion;
    AdminRegionCountry: AdminRegionCountry;
    AdminRegionResponse: AdminRegionResponse;
    AdminReservation: AdminReservation;
    AdminReservationResponse: AdminReservationResponse;
    AdminReturn: AdminReturn;
    AdminReturnItem: AdminReturnItem;
    AdminReturnPreviewResponse: AdminReturnPreviewResponse;
    AdminReturnReason: AdminReturnReason;
    AdminReturnReasonDeleteResponse: AdminReturnReasonDeleteResponse;
    AdminReturnReasonListResponse: AdminReturnReasonListResponse;
    AdminReturnReasonResponse: AdminReturnReasonResponse;
    AdminReturnResponse: AdminReturnResponse;
    AdminRevokeApiKey: AdminRevokeApiKey;
    AdminRuleAttributeOption: AdminRuleAttributeOption;
    AdminRuleValueOption: AdminRuleValueOption;
    AdminSalesChannel: AdminSalesChannel;
    AdminSalesChannelDeleteResponse: AdminSalesChannelDeleteResponse;
    AdminSalesChannelResponse: AdminSalesChannelResponse;
    AdminServiceZone: AdminServiceZone;
    AdminServiceZoneDeleteResponse: AdminServiceZoneDeleteResponse;
    AdminServiceZoneResponse: AdminServiceZoneResponse;
    AdminShippingOption: AdminShippingOption;
    AdminShippingOptionDeleteResponse: AdminShippingOptionDeleteResponse;
    AdminShippingOptionPrice: AdminShippingOptionPrice;
    AdminShippingOptionPriceRule: AdminShippingOptionPriceRule;
    AdminShippingOptionResponse: AdminShippingOptionResponse;
    AdminShippingOptionRule: AdminShippingOptionRule;
    AdminShippingOptionType: AdminShippingOptionType;
    AdminShippingProfile: AdminShippingProfile;
    AdminShippingProfileDeleteResponse: AdminShippingProfileDeleteResponse;
    AdminShippingProfileResponse: AdminShippingProfileResponse;
    AdminStockLocation: AdminStockLocation;
    AdminStockLocationAddress: AdminStockLocationAddress;
    AdminStockLocationDeleteResponse: AdminStockLocationDeleteResponse;
    AdminStockLocationListResponse: AdminStockLocationListResponse;
    AdminStockLocationResponse: AdminStockLocationResponse;
    AdminStore: AdminStore;
    AdminStoreCurrency: AdminStoreCurrency;
    AdminStoreListResponse: AdminStoreListResponse;
    AdminStoreResponse: AdminStoreResponse;
    AdminTaxRate: AdminTaxRate;
    AdminTaxRateDeleteResponse: AdminTaxRateDeleteResponse;
    AdminTaxRateResponse: AdminTaxRateResponse;
    AdminTaxRateRule: AdminTaxRateRule;
    AdminTaxRegion: AdminTaxRegion;
    AdminTaxRegionDeleteResponse: AdminTaxRegionDeleteResponse;
    AdminTaxRegionResponse: AdminTaxRegionResponse;
    AdminTransferOrder: AdminTransferOrder;
    AdminUpdateApiKey: AdminUpdateApiKey;
    AdminUpdateCollection: AdminUpdateCollection;
    AdminUpdateCustomerGroup: AdminUpdateCustomerGroup;
    AdminUpdateDraftOrder: AdminUpdateDraftOrder;
    AdminUpdateOrder: AdminUpdateOrder;
    AdminUpdatePriceList: AdminUpdatePriceList;
    AdminUpdatePricePreference: AdminUpdatePricePreference;
    AdminUpdateProduct: AdminUpdateProduct;
    AdminUpdateProductOption: AdminUpdateProductOption;
    AdminUpdateProductVariant: AdminUpdateProductVariant;
    AdminUpdatePromotionRule: AdminUpdatePromotionRule;
    AdminUpdateReturnReason: AdminUpdateReturnReason;
    AdminUpdateSalesChannel: AdminUpdateSalesChannel;
    AdminUpdateShippingOptionRule: AdminUpdateShippingOptionRule;
    AdminUpdateStockLocation: AdminUpdateStockLocation;
    AdminUpdateStore: AdminUpdateStore;
    AdminUpdateTaxRate: AdminUpdateTaxRate;
    AdminUpdateTaxRegion: AdminUpdateTaxRegion;
    AdminUpdateUser: AdminUpdateUser;
    AdminUpdateVariantInventoryItem: AdminUpdateVariantInventoryItem;
    AdminUpsertStockLocationAddress: AdminUpsertStockLocationAddress;
    AdminUser: AdminUser;
    AdminUserDeleteResponse: AdminUserDeleteResponse;
    AdminUserListResponse: AdminUserListResponse;
    AdminUserResponse: AdminUserResponse;
    AdminWorkflowExecution: AdminWorkflowExecution;
    AdminWorkflowExecutionExecution: AdminWorkflowExecutionExecution;
    AdminWorkflowExecutionResponse: AdminWorkflowExecutionResponse;
    ApiKeyResponse: ApiKeyResponse;
    AuthAdminSessionResponse: AuthAdminSessionResponse;
    AuthCallbackResponse: AuthCallbackResponse;
    AuthResponse: AuthResponse;
    AuthStoreSessionResponse: AuthStoreSessionResponse;
    BaseCalculatedPriceSet: BaseCalculatedPriceSet;
    BaseCapture: BaseCapture;
    BaseCart: BaseCart;
    BaseCartAddress: BaseCartAddress;
    BaseCartLineItem: BaseCartLineItem;
    BaseCartShippingMethod: BaseCartShippingMethod;
    BaseClaimItem: BaseClaimItem;
    BaseCollection: BaseCollection;
    BaseExchangeItem: BaseExchangeItem;
    BaseFulfillmentProvider: BaseFulfillmentProvider;
    BaseLineItemAdjustment: BaseLineItemAdjustment;
    BaseLineItemTaxLine: BaseLineItemTaxLine;
    BaseOrder: BaseOrder;
    BaseOrderAddress: BaseOrderAddress;
    BaseOrderFulfillment: BaseOrderFulfillment;
    BaseOrderItemDetail: BaseOrderItemDetail;
    BaseOrderLineItem: BaseOrderLineItem;
    BaseOrderLineItemAdjustment: BaseOrderLineItemAdjustment;
    BaseOrderLineItemTaxLine: BaseOrderLineItemTaxLine;
    BaseOrderShippingDetail: BaseOrderShippingDetail;
    BaseOrderShippingMethod: BaseOrderShippingMethod;
    BaseOrderShippingMethodAdjustment: BaseOrderShippingMethodAdjustment;
    BaseOrderShippingMethodTaxLine: BaseOrderShippingMethodTaxLine;
    BaseOrderSummary: BaseOrderSummary;
    BaseOrderTransaction: BaseOrderTransaction;
    BasePayment: BasePayment;
    BasePaymentCollection: BasePaymentCollection;
    BasePaymentProvider: BasePaymentProvider;
    BasePaymentSession: BasePaymentSession;
    BaseProduct: BaseProduct;
    BaseProductCategory: BaseProductCategory;
    BaseProductImage: BaseProductImage;
    BaseProductOption: BaseProductOption;
    BaseProductOptionValue: BaseProductOptionValue;
    BaseProductTag: BaseProductTag;
    BaseProductType: BaseProductType;
    BaseProductVariant: BaseProductVariant;
    BasePromotionRuleValue: BasePromotionRuleValue;
    BaseRefund: BaseRefund;
    BaseRegion: BaseRegion;
    BaseRegionCountry: BaseRegionCountry;
    BaseRuleOperatorOptions: BaseRuleOperatorOptions;
    BaseShippingMethodAdjustment: BaseShippingMethodAdjustment;
    BaseShippingMethodTaxLine: BaseShippingMethodTaxLine;
    CampaignResponse: CampaignResponse;
    CreateAddress: CreateAddress;
    CustomerGroupInCustomerFilters: CustomerGroupInCustomerFilters;
    Error: Error2;
    InventoryLevel: InventoryLevel;
    Order: Order11;
    OrderAddress: OrderAddress;
    OrderChange: OrderChange5;
    OrderChangeAction: OrderChangeAction;
    OrderClaim: OrderClaim;
    OrderCreditLine: OrderCreditLine;
    OrderExchange: OrderExchange;
    OrderItem: OrderItem;
    OrderLineItem: OrderLineItem;
    OrderLineItemAdjustment: OrderLineItemAdjustment;
    OrderLineItemTaxLine: OrderLineItemTaxLine;
    OrderReturnItem: OrderReturnItem;
    OrderShippingMethod: OrderShippingMethod;
    OrderShippingMethodAdjustment: OrderShippingMethodAdjustment;
    OrderShippingMethodTaxLine: OrderShippingMethodTaxLine;
    OrderTransaction: OrderTransaction;
    RefundReason: RefundReason3;
    RefundReasonResponse: RefundReasonResponse;
    Return: Return12;
    StoreAcceptOrderTransfer: StoreAcceptOrderTransfer;
    StoreAddCartLineItem: StoreAddCartLineItem;
    StoreCalculatedPrice: StoreCalculatedPrice;
    StoreCart: StoreCart;
    StoreCartAddPromotion: StoreCartAddPromotion;
    StoreCartAddress: StoreCartAddress;
    StoreCartLineItem: StoreCartLineItem;
    StoreCartPromotion: StoreCartPromotion;
    StoreCartResponse: StoreCartResponse;
    StoreCartShippingMethod: StoreCartShippingMethod;
    StoreCartShippingOption: StoreCartShippingOption;
    StoreCollection: StoreCollection;
    StoreCollectionResponse: StoreCollectionResponse;
    StoreCreateCart: StoreCreateCart;
    StoreCreateCustomer: StoreCreateCustomer;
    StoreCreatePaymentCollection: StoreCreatePaymentCollection;
    StoreCreateReturn: StoreCreateReturn;
    StoreCreateReturnItem: StoreCreateReturnItem;
    StoreCreateReturnShipping: StoreCreateReturnShipping;
    StoreCurrency: StoreCurrency;
    StoreCurrencyListResponse: StoreCurrencyListResponse;
    StoreCurrencyResponse: StoreCurrencyResponse;
    StoreCustomer: StoreCustomer;
    StoreCustomerAddress: StoreCustomerAddress;
    StoreCustomerAddressListResponse: StoreCustomerAddressListResponse;
    StoreCustomerAddressResponse: StoreCustomerAddressResponse;
    StoreCustomerResponse: StoreCustomerResponse;
    StoreDeclineOrderTransferRequest: StoreDeclineOrderTransferRequest;
    StoreInitializePaymentSession: StoreInitializePaymentSession;
    StoreOrder: StoreOrder;
    StoreOrderAddress: StoreOrderAddress;
    StoreOrderFulfillment: StoreOrderFulfillment;
    StoreOrderLineItem: StoreOrderLineItem;
    StoreOrderResponse: StoreOrderResponse;
    StoreOrderShippingMethod: StoreOrderShippingMethod;
    StorePaymentCollection: StorePaymentCollection;
    StorePaymentCollectionResponse: StorePaymentCollectionResponse;
    StorePaymentProvider: StorePaymentProvider;
    StorePaymentSession: StorePaymentSession;
    StorePrice: StorePrice;
    StorePriceRule: StorePriceRule;
    StoreProduct: StoreProduct;
    StoreProductCategory: StoreProductCategory;
    StoreProductCategoryListResponse: StoreProductCategoryListResponse;
    StoreProductCategoryResponse: StoreProductCategoryResponse;
    StoreProductImage: StoreProductImage;
    StoreProductOption: StoreProductOption;
    StoreProductOptionValue: StoreProductOptionValue;
    StoreProductResponse: StoreProductResponse;
    StoreProductTag: StoreProductTag;
    StoreProductTagListResponse: StoreProductTagListResponse;
    StoreProductTagResponse: StoreProductTagResponse;
    StoreProductType: StoreProductType;
    StoreProductTypeListResponse: StoreProductTypeListResponse;
    StoreProductTypeResponse: StoreProductTypeResponse;
    StoreProductVariant: StoreProductVariant;
    StoreRegion: StoreRegion;
    StoreRegionCountry: StoreRegionCountry;
    StoreRequestOrderTransfer: StoreRequestOrderTransfer;
    StoreReturn: StoreReturn2;
    StoreReturnItem: StoreReturnItem;
    StoreReturnReason: StoreReturnReason;
    StoreReturnReasonResponse: StoreReturnReasonResponse;
    StoreReturnResponse: StoreReturnResponse;
    StoreShippingOption: StoreShippingOption;
    StoreShippingOptionListResponse: StoreShippingOptionListResponse;
    StoreShippingOptionResponse: StoreShippingOptionResponse;
    StoreShippingOptionType: StoreShippingOptionType;
    StoreUpdateCartLineItem: StoreUpdateCartLineItem;
    StoreUpdateCustomer: StoreUpdateCustomer;
    UpdateAddress: UpdateAddress;
    UpdateCartData: UpdateCartData;
    WorkflowExecutionContext: WorkflowExecutionContext;
}

export interface AdminApiKey {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties33;
}

export interface Properties33 {
    id: Id3;
    token: Token;
    redacted: Redacted;
    title: Title;
    type: Type3;
    last_used_at: LastUsedAt;
    created_by: CreatedBy;
    created_at: CreatedAt;
    revoked_by: RevokedBy;
    revoked_at: RevokedAt;
    updated_at: UpdatedAt;
    deleted_at: DeletedAt;
}

export interface Id3 {
    type: string;
    title: string;
    description: string;
}

export interface Token {
    type: string;
    title: string;
    description: string;
}

export interface Redacted {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Title {
    type: string;
    title: string;
    description: string;
}

export interface Type3 {
    type: string;
    description: string;
    enum: string[];
}

export interface LastUsedAt {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CreatedBy {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface RevokedBy {
    type: string;
    title: string;
    description: string;
}

export interface RevokedAt {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface UpdatedAt {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminApiKeyResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties34;
}

export interface Properties34 {
    api_key: ApiKey;
}

export interface ApiKey {
    $ref: string;
}

export interface AdminApplicationMethod {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties35;
}

export interface Properties35 {
    promotion: Promotion;
    target_rules: TargetRules;
    buy_rules: BuyRules;
    id: Id4;
    type: Type4;
    target_type: TargetType;
    allocation: Allocation;
    value: Value2;
    currency_code: CurrencyCode;
    max_quantity: MaxQuantity;
    buy_rules_min_quantity: BuyRulesMinQuantity;
    apply_to_quantity: ApplyToQuantity;
}

export interface Promotion {
    type: string;
}

export interface TargetRules {
    type: string;
    description: string;
    items: Items115;
}

export interface Items115 {
    $ref: string;
}

export interface BuyRules {
    type: string;
    description: string;
    items: Items116;
}

export interface Items116 {
    $ref: string;
}

export interface Id4 {
    type: string;
    title: string;
    description: string;
}

export interface Type4 {
    type: string;
    description: string;
    enum: string[];
}

export interface TargetType {
    type: string;
    description: string;
    enum: string[];
}

export interface Allocation {
    type: string;
    description: string;
    enum: string[];
}

export interface Value2 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface MaxQuantity {
    type: string;
    title: string;
    description: string;
}

export interface BuyRulesMinQuantity {
    type: string;
    title: string;
    description: string;
}

export interface ApplyToQuantity {
    type: string;
    title: string;
    description: string;
}

export interface AdminBatchCreateInventoryItemsLocationLevels {
    "type": string;
    "description": string;
    "required": string[];
    "properties": Properties36;
    "x-schemaName": string;
}

export interface Properties36 {
    location_id: LocationId;
    inventory_item_id: InventoryItemId;
    stocked_quantity: StockedQuantity;
    incoming_quantity: IncomingQuantity;
}

export interface LocationId {
    type: string;
    title: string;
    description: string;
}

export interface InventoryItemId {
    type: string;
    title: string;
    description: string;
}

export interface StockedQuantity {
    type: string;
    title: string;
    description: string;
}

export interface IncomingQuantity {
    type: string;
    title: string;
    description: string;
}

export interface AdminBatchInventoryItemLocationsLevel {
    "type": string;
    "description": string;
    "properties": Properties37;
    "x-schemaName": string;
}

export interface Properties37 {
    create: Create;
    update: Update;
    delete: Delete5;
    force: Force;
}

export interface Create {
    type: string;
    description: string;
    items: Items117;
}

export interface Items117 {
    type: string;
    description: string;
    required: string[];
    properties: Properties38;
}

export interface Properties38 {
    location_id: LocationId2;
    stocked_quantity: StockedQuantity2;
    incoming_quantity: IncomingQuantity2;
}

export interface LocationId2 {
    type: string;
    title: string;
    description: string;
}

export interface StockedQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface IncomingQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface Update {
    type: string;
    description: string;
    items: Items118;
}

export interface Items118 {
    type: string;
    description: string;
    properties: Properties39;
    required: string[];
}

export interface Properties39 {
    stocked_quantity: StockedQuantity3;
    incoming_quantity: IncomingQuantity3;
    location_id: LocationId3;
    id: Id5;
}

export interface StockedQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface IncomingQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId3 {
    type: string;
    title: string;
    description: string;
}

export interface Id5 {
    type: string;
    title: string;
    description: string;
}

export interface Delete5 {
    type: string;
    description: string;
    items: Items119;
}

export interface Items119 {
    type: string;
    title: string;
    description: string;
}

export interface Force {
    type: string;
    title: string;
    description: string;
}

export interface AdminBatchInventoryItemsLocationLevels {
    "type": string;
    "description": string;
    "properties": Properties40;
    "required": string[];
    "x-schemaName": string;
}

export interface Properties40 {
    create: Create2;
    update: Update2;
    delete: Delete6;
    force: Force2;
}

export interface Create2 {
    type: string;
    description: string;
    items: Items120;
}

export interface Items120 {
    $ref: string;
}

export interface Update2 {
    type: string;
    description: string;
    items: Items121;
}

export interface Items121 {
    $ref: string;
}

export interface Delete6 {
    type: string;
    description: string;
    items: Items122;
}

export interface Items122 {
    type: string;
    title: string;
    description: string;
}

export interface Force2 {
    type: string;
    title: string;
    description: string;
}

export interface AdminBatchInventoryItemsLocationLevelsResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties41;
}

export interface Properties41 {
    created: Created;
    updated: Updated;
    deleted: Deleted3;
}

export interface Created {
    type: string;
    description: string;
    items: Items123;
}

export interface Items123 {
    $ref: string;
}

export interface Updated {
    type: string;
    description: string;
    items: Items124;
}

export interface Items124 {
    $ref: string;
}

export interface Deleted3 {
    type: string;
    description: string;
    items: Items125;
}

export interface Items125 {
    type: string;
    title: string;
    description: string;
}

export interface AdminBatchProductRequest {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties42;
}

export interface Properties42 {
    create: Create3;
    update: Update3;
    delete: Delete7;
}

export interface Create3 {
    type: string;
    description: string;
    items: Items126;
}

export interface Items126 {
    $ref: string;
}

export interface Update3 {
    type: string;
    description: string;
    items: Items127;
}

export interface Items127 {
    $ref: string;
}

export interface Delete7 {
    type: string;
    description: string;
    items: Items128;
}

export interface Items128 {
    type: string;
    title: string;
    description: string;
}

export interface AdminBatchProductResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties43;
}

export interface Properties43 {
    created: Created2;
    updated: Updated2;
    deleted: Deleted4;
}

export interface Created2 {
    type: string;
    description: string;
    items: Items129;
}

export interface Items129 {
    $ref: string;
}

export interface Updated2 {
    type: string;
    description: string;
    items: Items130;
}

export interface Items130 {
    $ref: string;
}

export interface Deleted4 {
    type: string;
    description: string;
    required: string[];
    properties: Properties44;
}

export interface Properties44 {
    ids: Ids;
    object: Object3;
    deleted: Deleted5;
}

export interface Ids {
    type: string;
    description: string;
    items: Items131;
}

export interface Items131 {
    type: string;
    title: string;
    description: string;
}

export interface Object3 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted5 {
    type: string;
    title: string;
    description: string;
}

export interface AdminBatchProductVariantRequest {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties45;
}

export interface Properties45 {
    create: Create4;
    update: Update4;
    delete: Delete8;
}

export interface Create4 {
    type: string;
    description: string;
    items: Items132;
}

export interface Items132 {
    $ref: string;
}

export interface Update4 {
    type: string;
    description: string;
    items: Items133;
}

export interface Items133 {
    $ref: string;
}

export interface Delete8 {
    type: string;
    description: string;
    items: Items134;
}

export interface Items134 {
    type: string;
    title: string;
    description: string;
}

export interface AdminBatchProductVariantResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties46;
}

export interface Properties46 {
    created: Created3;
    updated: Updated3;
    deleted: Deleted6;
}

export interface Created3 {
    type: string;
    description: string;
    items: Items135;
}

export interface Items135 {
    $ref: string;
}

export interface Updated3 {
    type: string;
    description: string;
    items: Items136;
}

export interface Items136 {
    $ref: string;
}

export interface Deleted6 {
    type: string;
    description: string;
    required: string[];
    properties: Properties47;
}

export interface Properties47 {
    ids: Ids2;
    object: Object4;
    deleted: Deleted7;
}

export interface Ids2 {
    type: string;
    description: string;
    items: Items137;
}

export interface Items137 {
    type: string;
    title: string;
    description: string;
}

export interface Object4 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted7 {
    type: string;
    title: string;
    description: string;
}

export interface AdminBatchUpdateInventoryItemsLocationLevels {
    "type": string;
    "description": string;
    "required": string[];
    "properties": Properties48;
    "x-schemaName": string;
}

export interface Properties48 {
    location_id: LocationId4;
    inventory_item_id: InventoryItemId2;
    stocked_quantity: StockedQuantity4;
    incoming_quantity: IncomingQuantity4;
    id: Id6;
}

export interface LocationId4 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryItemId2 {
    type: string;
    title: string;
    description: string;
}

export interface StockedQuantity4 {
    type: string;
    title: string;
    description: string;
}

export interface IncomingQuantity4 {
    type: string;
    title: string;
    description: string;
}

export interface Id6 {
    type: string;
    title: string;
    description: string;
}

export interface AdminBatchUpdateProduct {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties49;
    "required": string[];
}

export interface Properties49 {
    title: Title2;
    subtitle: Subtitle;
    description: Description;
    is_giftcard: IsGiftcard;
    discountable: Discountable;
    images: Images;
    thumbnail: Thumbnail;
    handle: Handle;
    status: Status;
    type_id: TypeId;
    collection_id: CollectionId;
    categories: Categories;
    tags: Tags;
    options: Options2;
    variants: Variants;
    sales_channels: SalesChannels;
    weight: Weight;
    length: Length;
    height: Height;
    width: Width;
    hs_code: HsCode;
    mid_code: MidCode;
    origin_country: OriginCountry;
    material: Material;
    metadata: Metadata3;
    external_id: ExternalId;
    id: Id10;
    shipping_profile_id: ShippingProfileId;
}

export interface Title2 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle {
    type: string;
    title: string;
    description: string;
}

export interface Description {
    type: string;
    title: string;
    description: string;
}

export interface IsGiftcard {
    type: string;
    title: string;
    description: string;
}

export interface Discountable {
    type: string;
    title: string;
    description: string;
}

export interface Images {
    type: string;
    description: string;
    items: Items138;
}

export interface Items138 {
    type: string;
    description: string;
    required: string[];
    properties: Properties50;
}

export interface Properties50 {
    url: Url;
}

export interface Url {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail {
    type: string;
    title: string;
    description: string;
}

export interface Handle {
    type: string;
    title: string;
    description: string;
}

export interface Status {
    type: string;
    description: string;
    enum: string[];
}

export interface TypeId {
    type: string;
    title: string;
    description: string;
}

export interface CollectionId {
    type: string;
    title: string;
    description: string;
}

export interface Categories {
    type: string;
    description: string;
    items: Items139;
}

export interface Items139 {
    type: string;
    description: string;
    required: string[];
    properties: Properties51;
}

export interface Properties51 {
    id: Id7;
}

export interface Id7 {
    type: string;
    title: string;
    description: string;
}

export interface Tags {
    type: string;
    description: string;
    items: Items140;
}

export interface Items140 {
    type: string;
    description: string;
    required: string[];
    properties: Properties52;
}

export interface Properties52 {
    id: Id8;
}

export interface Id8 {
    type: string;
    title: string;
    description: string;
}

export interface Options2 {
    type: string;
    description: string;
    items: Items141;
}

export interface Items141 {
    $ref: string;
}

export interface Variants {
    type: string;
    description: string;
    items: Items142;
}

export interface Items142 {
    oneOf: OneOf32[];
}

export interface OneOf32 {
    $ref: string;
}

export interface SalesChannels {
    type: string;
    description: string;
    items: Items143;
}

export interface Items143 {
    type: string;
    description: string;
    required: string[];
    properties: Properties53;
}

export interface Properties53 {
    id: Id9;
}

export interface Id9 {
    type: string;
    title: string;
    description: string;
}

export interface Weight {
    type: string;
    title: string;
    description: string;
}

export interface Length {
    type: string;
    title: string;
    description: string;
}

export interface Height {
    type: string;
    title: string;
    description: string;
}

export interface Width {
    type: string;
    title: string;
    description: string;
}

export interface HsCode {
    type: string;
    title: string;
    description: string;
}

export interface MidCode {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry {
    type: string;
    title: string;
    description: string;
}

export interface Material {
    type: string;
    title: string;
    description: string;
}

export interface Metadata3 {
    type: string;
    description: string;
}

export interface ExternalId {
    type: string;
    title: string;
    description: string;
}

export interface Id10 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingProfileId {
    type: string;
    title: string;
    description: string;
}

export interface AdminBatchUpdateProductVariant {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties54;
    "required": string[];
}

export interface Properties54 {
    title: Title3;
    sku: Sku;
    ean: Ean;
    upc: Upc;
    barcode: Barcode;
    hs_code: HsCode2;
    mid_code: MidCode2;
    allow_backorder: AllowBackorder;
    manage_inventory: ManageInventory;
    variant_rank: VariantRank;
    weight: Weight2;
    length: Length2;
    height: Height2;
    width: Width2;
    origin_country: OriginCountry2;
    material: Material2;
    metadata: Metadata4;
    prices: Prices;
    options: Options3;
    id: Id11;
}

export interface Title3 {
    type: string;
    title: string;
    description: string;
}

export interface Sku {
    type: string;
    title: string;
    description: string;
}

export interface Ean {
    type: string;
    title: string;
    description: string;
}

export interface Upc {
    type: string;
    title: string;
    description: string;
}

export interface Barcode {
    type: string;
    title: string;
    description: string;
}

export interface HsCode2 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode2 {
    type: string;
    title: string;
    description: string;
}

export interface AllowBackorder {
    type: string;
    title: string;
    description: string;
}

export interface ManageInventory {
    type: string;
    title: string;
    description: string;
}

export interface VariantRank {
    type: string;
    title: string;
    description: string;
}

export interface Weight2 {
    type: string;
    title: string;
    description: string;
}

export interface Length2 {
    type: string;
    title: string;
    description: string;
}

export interface Height2 {
    type: string;
    title: string;
    description: string;
}

export interface Width2 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry2 {
    type: string;
    title: string;
    description: string;
}

export interface Material2 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata4 {
    type: string;
    description: string;
}

export interface Prices {
    type: string;
    description: string;
    items: Items144;
}

export interface Items144 {
    $ref: string;
}

export interface Options3 {
    type: string;
    description: string;
}

export interface Id11 {
    type: string;
    title: string;
    description: string;
}

export interface AdminCampaign {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties55;
}

export interface Properties55 {
    id: Id12;
    name: Name2;
    description: Description2;
    currency: Currency;
    campaign_identifier: CampaignIdentifier;
    starts_at: StartsAt;
    ends_at: EndsAt;
    budget: Budget;
    created_at: CreatedAt2;
    updated_at: UpdatedAt2;
    deleted_at: DeletedAt2;
}

export interface Id12 {
    type: string;
    title: string;
    description: string;
}

export interface Name2 {
    type: string;
    title: string;
    description: string;
}

export interface Description2 {
    type: string;
    title: string;
    description: string;
}

export interface Currency {
    type: string;
    title: string;
    description: string;
}

export interface CampaignIdentifier {
    type: string;
    title: string;
    description: string;
}

export interface StartsAt {
    type: string;
    title: string;
    description: string;
}

export interface EndsAt {
    type: string;
    title: string;
    description: string;
}

export interface Budget {
    type: string;
    description: string;
    required: string[];
    properties: Properties56;
}

export interface Properties56 {
    id: Id13;
    type: Type5;
    currency_code: CurrencyCode2;
    limit: Limit7;
    used: Used;
}

export interface Id13 {
    type: string;
    title: string;
    description: string;
}

export interface Type5 {
    type: string;
    description: string;
    enum: string[];
}

export interface CurrencyCode2 {
    type: string;
    title: string;
    description: string;
}

export interface Limit7 {
    type: string;
    title: string;
    description: string;
}

export interface Used {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt2 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt2 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt2 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminCampaignResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties57;
}

export interface Properties57 {
    campaign: Campaign;
}

export interface Campaign {
    $ref: string;
}

export interface AdminClaim {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties58;
}

export interface Properties58 {
    id: Id14;
    order_id: OrderId;
    claim_items: ClaimItems;
    additional_items: AdditionalItems;
    return: Return;
    return_id: ReturnId;
    no_notification: NoNotification;
    refund_amount: RefundAmount;
    display_id: DisplayId;
    shipping_methods: ShippingMethods;
    transactions: Transactions;
    metadata: Metadata5;
    created_at: CreatedAt3;
    updated_at: UpdatedAt3;
    order: Order2;
    type: Type6;
    order_version: OrderVersion;
    created_by: CreatedBy2;
    canceled_at: CanceledAt;
    deleted_at: DeletedAt3;
}

export interface Id14 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId {
    type: string;
    title: string;
    description: string;
}

export interface ClaimItems {
    type: string;
    description: string;
    items: Items145;
}

export interface Items145 {
    $ref: string;
}

export interface AdditionalItems {
    type: string;
    description: string;
    items: Items146;
}

export interface Items146 {
    $ref: string;
}

export interface Return {
    $ref: string;
}

export interface ReturnId {
    type: string;
    title: string;
    description: string;
}

export interface NoNotification {
    type: string;
    title: string;
    description: string;
}

export interface RefundAmount {
    type: string;
    title: string;
    description: string;
}

export interface DisplayId {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethods {
    type: string;
    description: string;
    items: Items147;
}

export interface Items147 {
    $ref: string;
}

export interface Transactions {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
    items: Items148;
}

export interface ExternalDocs83 {
    url: string;
    description: string;
}

export interface Items148 {
    $ref: string;
}

export interface Metadata5 {
    type: string;
    description: string;
}

export interface CreatedAt3 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt3 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Order2 {
    $ref: string;
}

export interface Type6 {
    type: string;
    description: string;
    enum: string[];
}

export interface OrderVersion {
    type: string;
    title: string;
    description: string;
}

export interface CreatedBy2 {
    type: string;
    title: string;
    description: string;
}

export interface CanceledAt {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DeletedAt3 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminClaimDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties59;
}

export interface Properties59 {
    id: Id15;
    object: Object5;
    deleted: Deleted8;
}

export interface Id15 {
    type: string;
    title: string;
    description: string;
}

export interface Object5 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted8 {
    type: string;
    title: string;
    description: string;
}

export interface AdminClaimListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties60;
}

export interface Properties60 {
    limit: Limit8;
    offset: Offset7;
    count: Count7;
    claims: Claims;
}

export interface Limit8 {
    type: string;
    title: string;
    description: string;
}

export interface Offset7 {
    type: string;
    title: string;
    description: string;
}

export interface Count7 {
    type: string;
    title: string;
    description: string;
}

export interface Claims {
    type: string;
    description: string;
    items: Items149;
}

export interface Items149 {
    $ref: string;
}

export interface AdminClaimOrderResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties61;
}

export interface Properties61 {
    order: Order3;
    claim: Claim;
}

export interface Order3 {
    $ref: string;
}

export interface Claim {
    $ref: string;
}

export interface AdminClaimPreviewResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties62;
}

export interface Properties62 {
    order_preview: OrderPreview;
    claim: Claim2;
}

export interface OrderPreview {
    $ref: string;
}

export interface Claim2 {
    $ref: string;
}

export interface AdminClaimRequestResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties63;
}

export interface Properties63 {
    return: Return2;
    order_preview: OrderPreview2;
    claim: Claim3;
}

export interface Return2 {
    $ref: string;
}

export interface OrderPreview2 {
    $ref: string;
}

export interface Claim3 {
    $ref: string;
}

export interface AdminClaimResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties64;
}

export interface Properties64 {
    claim: Claim4;
}

export interface Claim4 {
    $ref: string;
}

export interface AdminClaimReturnPreviewResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties65;
}

export interface Properties65 {
    order_preview: OrderPreview3;
    return: Return3;
}

export interface OrderPreview3 {
    $ref: string;
}

export interface Return3 {
    $ref: string;
}

export interface AdminCollection {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties66;
}

export interface Properties66 {
    id: Id16;
    title: Title4;
    handle: Handle2;
    created_at: CreatedAt4;
    updated_at: UpdatedAt4;
    deleted_at: DeletedAt4;
    products: Products2;
    metadata: Metadata6;
}

export interface Id16 {
    type: string;
    title: string;
    description: string;
}

export interface Title4 {
    type: string;
    title: string;
    description: string;
}

export interface Handle2 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt4 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt4 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt4 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Products2 {
    type: string;
    description: string;
    items: Items150;
}

export interface Items150 {
    $ref: string;
}

export interface Metadata6 {
    type: string;
    description: string;
}

export interface AdminCollectionDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties67;
}

export interface Properties67 {
    id: Id17;
    object: Object6;
    deleted: Deleted9;
}

export interface Id17 {
    type: string;
    title: string;
    description: string;
}

export interface Object6 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted9 {
    type: string;
    title: string;
    description: string;
}

export interface AdminCollectionListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties68;
}

export interface Properties68 {
    limit: Limit9;
    offset: Offset8;
    count: Count8;
    collections: Collections2;
}

export interface Limit9 {
    type: string;
    title: string;
    description: string;
}

export interface Offset8 {
    type: string;
    title: string;
    description: string;
}

export interface Count8 {
    type: string;
    title: string;
    description: string;
}

export interface Collections2 {
    type: string;
    description: string;
    items: Items151;
}

export interface Items151 {
    $ref: string;
}

export interface AdminCollectionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties69;
}

export interface Properties69 {
    collection: Collection;
}

export interface Collection {
    $ref: string;
}

export interface AdminCreateApiKey {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties70;
}

export interface Properties70 {
    title: Title5;
    type: Type7;
}

export interface Title5 {
    type: string;
    title: string;
    description: string;
}

export interface Type7 {
    type: string;
    description: string;
    enum: string[];
}

export interface AdminCreateCollection {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties71;
}

export interface Properties71 {
    title: Title6;
    handle: Handle3;
    metadata: Metadata7;
}

export interface Title6 {
    type: string;
    title: string;
    description: string;
}

export interface Handle3 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata7 {
    type: string;
    description: string;
}

export interface AdminCreateCustomerGroup {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties72;
}

export interface Properties72 {
    name: Name3;
    metadata: Metadata8;
}

export interface Name3 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata8 {
    type: string;
    description: string;
}

export interface AdminCreateFulfillment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties73;
}

export interface Properties73 {
    location_id: LocationId5;
    provider_id: ProviderId;
    delivery_address: DeliveryAddress;
    items: Items152;
    labels: Labels;
    order_id: OrderId2;
    shipping_option_id: ShippingOptionId;
    data: Data3;
    packed_at: PackedAt;
    shipped_at: ShippedAt;
    delivered_at: DeliveredAt;
    canceled_at: CanceledAt2;
    metadata: Metadata10;
}

export interface LocationId5 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId {
    type: string;
    title: string;
    description: string;
}

export interface DeliveryAddress {
    type: string;
    description: string;
    properties: Properties74;
}

export interface Properties74 {
    first_name: FirstName3;
    last_name: LastName3;
    phone: Phone3;
    company: Company3;
    address_1: Address13;
    address_2: Address23;
    city: City3;
    country_code: CountryCode3;
    province: Province3;
    postal_code: PostalCode3;
    metadata: Metadata9;
}

export interface FirstName3 {
    type: string;
    title: string;
    description: string;
}

export interface LastName3 {
    type: string;
    title: string;
    description: string;
}

export interface Phone3 {
    type: string;
    title: string;
    description: string;
}

export interface Company3 {
    type: string;
    title: string;
    description: string;
}

export interface Address13 {
    type: string;
    title: string;
    description: string;
}

export interface Address23 {
    type: string;
    title: string;
    description: string;
}

export interface City3 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode3 {
    type: string;
    title: string;
    description: string;
}

export interface Province3 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode3 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata9 {
    type: string;
    description: string;
}

export interface Items152 {
    type: string;
    description: string;
    items: Items153;
}

export interface Items153 {
    type: string;
    description: string;
    required: string[];
    properties: Properties75;
}

export interface Properties75 {
    title: Title7;
    sku: Sku2;
    quantity: Quantity;
    barcode: Barcode2;
    line_item_id: LineItemId;
    inventory_item_id: InventoryItemId3;
}

export interface Title7 {
    type: string;
    title: string;
    description: string;
}

export interface Sku2 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity {
    type: string;
    title: string;
    description: string;
}

export interface Barcode2 {
    type: string;
    title: string;
    description: string;
}

export interface LineItemId {
    type: string;
    title: string;
    description: string;
}

export interface InventoryItemId3 {
    type: string;
    title: string;
    description: string;
}

export interface Labels {
    type: string;
    description: string;
    items: Items154;
}

export interface Items154 {
    type: string;
    description: string;
    required: string[];
    properties: Properties76;
}

export interface Properties76 {
    tracking_number: TrackingNumber;
    tracking_url: TrackingUrl;
    label_url: LabelUrl;
}

export interface TrackingNumber {
    type: string;
    title: string;
    description: string;
}

export interface TrackingUrl {
    type: string;
    title: string;
    description: string;
}

export interface LabelUrl {
    type: string;
    title: string;
    description: string;
}

export interface OrderId2 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId {
    type: string;
    title: string;
    description: string;
}

export interface Data3 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs84 {
    url: string;
    description: string;
}

export interface PackedAt {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface ShippedAt {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DeliveredAt {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CanceledAt2 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface Metadata10 {
    type: string;
    description: string;
}

export interface AdminCreateInventoryItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties77;
}

export interface Properties77 {
    sku: Sku3;
    hs_code: HsCode3;
    weight: Weight3;
    length: Length3;
    height: Height3;
    width: Width3;
    origin_country: OriginCountry3;
    mid_code: MidCode3;
    material: Material3;
    title: Title8;
    description: Description3;
    requires_shipping: RequiresShipping;
    thumbnail: Thumbnail2;
    metadata: Metadata11;
}

export interface Sku3 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode3 {
    type: string;
    title: string;
    description: string;
}

export interface Weight3 {
    type: string;
    title: string;
    description: string;
}

export interface Length3 {
    type: string;
    title: string;
    description: string;
}

export interface Height3 {
    type: string;
    title: string;
    description: string;
}

export interface Width3 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry3 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode3 {
    type: string;
    title: string;
    description: string;
}

export interface Material3 {
    type: string;
    title: string;
    description: string;
}

export interface Title8 {
    type: string;
    title: string;
    description: string;
}

export interface Description3 {
    type: string;
    title: string;
    description: string;
}

export interface RequiresShipping {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail2 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata11 {
    type: string;
    description: string;
}

export interface AdminCreatePriceList {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties78;
}

export interface Properties78 {
    title: Title9;
    description: Description4;
    starts_at: StartsAt2;
    ends_at: EndsAt2;
    status: Status2;
    type: Type8;
    rules: Rules;
    prices: Prices2;
}

export interface Title9 {
    type: string;
    title: string;
    description: string;
}

export interface Description4 {
    type: string;
    title: string;
    description: string;
}

export interface StartsAt2 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface EndsAt2 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface Status2 {
    type: string;
    description: string;
    enum: string[];
}

export interface Type8 {
    type: string;
    description: string;
    enum: string[];
}

export interface Rules {
    type: string;
    description: string;
    example: Example3;
}

export interface Example3 {
    product_category_id: string;
}

export interface Prices2 {
    type: string;
    description: string;
    items: Items155;
}

export interface Items155 {
    type: string;
    description: string;
    required: string[];
    properties: Properties79;
}

export interface Properties79 {
    currency_code: CurrencyCode3;
    amount: Amount;
    variant_id: VariantId;
    min_quantity: MinQuantity;
    max_quantity: MaxQuantity2;
    rules: Rules2;
}

export interface CurrencyCode3 {
    type: string;
    title: string;
    description: string;
}

export interface Amount {
    type: string;
    title: string;
    description: string;
}

export interface VariantId {
    type: string;
    title: string;
    description: string;
}

export interface MinQuantity {
    type: string;
    title: string;
    description: string;
}

export interface MaxQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface Rules2 {
    type: string;
    description: string;
    example: Example4;
}

export interface Example4 {
    region_id: string;
}

export interface AdminCreatePricePreference {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties80;
}

export interface Properties80 {
    attribute: Attribute;
    value: Value3;
    is_tax_inclusive: IsTaxInclusive;
}

export interface Attribute {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Value3 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface IsTaxInclusive {
    type: string;
    title: string;
    description: string;
}

export interface AdminCreateProduct {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties81;
}

export interface Properties81 {
    title: Title10;
    subtitle: Subtitle2;
    description: Description5;
    is_giftcard: IsGiftcard2;
    discountable: Discountable2;
    images: Images2;
    thumbnail: Thumbnail3;
    handle: Handle4;
    status: Status3;
    type_id: TypeId2;
    collection_id: CollectionId2;
    categories: Categories2;
    tags: Tags2;
    options: Options4;
    variants: Variants2;
    sales_channels: SalesChannels2;
    weight: Weight4;
    length: Length4;
    height: Height4;
    width: Width4;
    hs_code: HsCode4;
    mid_code: MidCode4;
    origin_country: OriginCountry4;
    material: Material4;
    metadata: Metadata12;
    external_id: ExternalId2;
    shipping_profile_id: ShippingProfileId2;
}

export interface Title10 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle2 {
    type: string;
    title: string;
    description: string;
}

export interface Description5 {
    type: string;
    title: string;
    description: string;
}

export interface IsGiftcard2 {
    type: string;
    title: string;
    description: string;
}

export interface Discountable2 {
    type: string;
    title: string;
    description: string;
}

export interface Images2 {
    type: string;
    description: string;
    items: Items156;
}

export interface Items156 {
    type: string;
    description: string;
    required: string[];
    properties: Properties82;
}

export interface Properties82 {
    url: Url2;
}

export interface Url2 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail3 {
    type: string;
    title: string;
    description: string;
}

export interface Handle4 {
    type: string;
    title: string;
    description: string;
}

export interface Status3 {
    type: string;
    description: string;
    enum: string[];
}

export interface TypeId2 {
    type: string;
    title: string;
    description: string;
}

export interface CollectionId2 {
    type: string;
    title: string;
    description: string;
}

export interface Categories2 {
    type: string;
    description: string;
    items: Items157;
}

export interface Items157 {
    type: string;
    description: string;
    required: string[];
    properties: Properties83;
}

export interface Properties83 {
    id: Id18;
}

export interface Id18 {
    type: string;
    title: string;
    description: string;
}

export interface Tags2 {
    type: string;
    description: string;
    items: Items158;
}

export interface Items158 {
    type: string;
    description: string;
    required: string[];
    properties: Properties84;
}

export interface Properties84 {
    id: Id19;
}

export interface Id19 {
    type: string;
    title: string;
    description: string;
}

export interface Options4 {
    type: string;
    description: string;
    items: Items159;
}

export interface Items159 {
    $ref: string;
}

export interface Variants2 {
    type: string;
    description: string;
    items: Items160;
}

export interface Items160 {
    $ref: string;
}

export interface SalesChannels2 {
    type: string;
    description: string;
    items: Items161;
}

export interface Items161 {
    type: string;
    description: string;
    required: string[];
    properties: Properties85;
}

export interface Properties85 {
    id: Id20;
}

export interface Id20 {
    type: string;
    title: string;
    description: string;
}

export interface Weight4 {
    type: string;
    title: string;
    description: string;
}

export interface Length4 {
    type: string;
    title: string;
    description: string;
}

export interface Height4 {
    type: string;
    title: string;
    description: string;
}

export interface Width4 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode4 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode4 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry4 {
    type: string;
    title: string;
    description: string;
}

export interface Material4 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata12 {
    type: string;
    description: string;
}

export interface ExternalId2 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingProfileId2 {
    type: string;
    title: string;
    description: string;
}

export interface AdminCreateProductCategory {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties86;
}

export interface Properties86 {
    name: Name4;
    description: Description6;
    handle: Handle5;
    is_internal: IsInternal;
    is_active: IsActive;
    parent_category_id: ParentCategoryId;
    rank: Rank;
    metadata: Metadata13;
}

export interface Name4 {
    type: string;
    title: string;
    description: string;
}

export interface Description6 {
    type: string;
    title: string;
    description: string;
}

export interface Handle5 {
    type: string;
    title: string;
    description: string;
}

export interface IsInternal {
    type: string;
    title: string;
    description: string;
}

export interface IsActive {
    type: string;
    title: string;
    description: string;
}

export interface ParentCategoryId {
    type: string;
    title: string;
    description: string;
}

export interface Rank {
    type: string;
    title: string;
    description: string;
}

export interface Metadata13 {
    type: string;
    description: string;
}

export interface AdminCreateProductOption {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties87;
}

export interface Properties87 {
    title: Title11;
    values: Values;
}

export interface Title11 {
    type: string;
    title: string;
    description: string;
}

export interface Values {
    type: string;
    description: string;
    items: Items162;
}

export interface Items162 {
    type: string;
    title: string;
    description: string;
}

export interface AdminCreateProductTag {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties88;
}

export interface Properties88 {
    value: Value4;
    metadata: Metadata14;
}

export interface Value4 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata14 {
    type: string;
    description: string;
}

export interface AdminCreateProductType {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties89;
}

export interface Properties89 {
    metadata: Metadata15;
    value: Value5;
}

export interface Metadata15 {
    type: string;
    description: string;
}

export interface Value5 {
    type: string;
    title: string;
    description: string;
}

export interface AdminCreateProductVariant {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties90;
}

export interface Properties90 {
    title: Title12;
    sku: Sku4;
    ean: Ean2;
    upc: Upc2;
    barcode: Barcode3;
    hs_code: HsCode5;
    mid_code: MidCode5;
    allow_backorder: AllowBackorder2;
    manage_inventory: ManageInventory2;
    variant_rank: VariantRank2;
    weight: Weight5;
    length: Length5;
    height: Height5;
    width: Width5;
    origin_country: OriginCountry5;
    material: Material5;
    metadata: Metadata16;
    prices: Prices3;
    options: Options5;
    inventory_items: InventoryItems;
}

export interface Title12 {
    type: string;
    title: string;
    description: string;
}

export interface Sku4 {
    type: string;
    title: string;
    description: string;
}

export interface Ean2 {
    type: string;
    title: string;
    description: string;
}

export interface Upc2 {
    type: string;
    title: string;
    description: string;
}

export interface Barcode3 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode5 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode5 {
    type: string;
    title: string;
    description: string;
}

export interface AllowBackorder2 {
    type: string;
    title: string;
    description: string;
}

export interface ManageInventory2 {
    type: string;
    title: string;
    description: string;
}

export interface VariantRank2 {
    type: string;
    title: string;
    description: string;
}

export interface Weight5 {
    type: string;
    title: string;
    description: string;
}

export interface Length5 {
    type: string;
    title: string;
    description: string;
}

export interface Height5 {
    type: string;
    title: string;
    description: string;
}

export interface Width5 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry5 {
    type: string;
    title: string;
    description: string;
}

export interface Material5 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata16 {
    type: string;
    description: string;
}

export interface Prices3 {
    type: string;
    description: string;
    items: Items163;
}

export interface Items163 {
    $ref: string;
}

export interface Options5 {
    type: string;
    description: string;
    example: Example5;
}

export interface Example5 {
    Color: string;
}

export interface InventoryItems {
    type: string;
    description: string;
    items: Items164;
}

export interface Items164 {
    $ref: string;
}

export interface AdminCreateProductVariantInventoryKit {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties91;
}

export interface Properties91 {
    inventory_item_id: InventoryItemId4;
    required_quantity: RequiredQuantity;
}

export interface InventoryItemId4 {
    type: string;
    title: string;
    description: string;
}

export interface RequiredQuantity {
    type: string;
    title: string;
    description: string;
}

export interface AdminCreateProductVariantPrice {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties92;
}

export interface Properties92 {
    currency_code: CurrencyCode4;
    amount: Amount2;
    min_quantity: MinQuantity2;
    max_quantity: MaxQuantity3;
    rules: Rules3;
}

export interface CurrencyCode4 {
    type: string;
    title: string;
    description: string;
}

export interface Amount2 {
    type: string;
    title: string;
    description: string;
}

export interface MinQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface MaxQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface Rules3 {
    type: string;
    description: string;
    example: Example6;
    properties: Properties93;
    required: string[];
}

export interface Example6 {
    region_id: string;
}

export interface Properties93 {
    region_id: RegionId;
}

export interface RegionId {
    type: string;
    title: string;
    description: string;
}

export interface AdminCreatePromotionRule {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties94;
}

export interface Properties94 {
    operator: Operator;
    description: Description7;
    attribute: Attribute2;
    values: Values2;
}

export interface Operator {
    type: string;
    description: string;
    enum: string[];
}

export interface Description7 {
    type: string;
    title: string;
    description: string;
}

export interface Attribute2 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Values2 {
    oneOf: OneOf33[];
}

export interface OneOf33 {
    type: string;
    title?: string;
    description: string;
    example?: string;
    items?: Items165;
}

export interface Items165 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface AdminCreateRefundReason {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties95;
}

export interface Properties95 {
    label: Label;
    description: Description8;
}

export interface Label {
    type: string;
    title: string;
    description: string;
}

export interface Description8 {
    type: string;
    title: string;
    description: string;
}

export interface AdminCreateRegion {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties96;
}

export interface Properties96 {
    name: Name5;
    currency_code: CurrencyCode5;
    countries: Countries;
    automatic_taxes: AutomaticTaxes;
    is_tax_inclusive: IsTaxInclusive2;
    payment_providers: PaymentProviders2;
    metadata: Metadata17;
}

export interface Name5 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode5 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Countries {
    type: string;
    description: string;
    items: Items166;
}

export interface Items166 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface AutomaticTaxes {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive2 {
    type: string;
    title: string;
    description: string;
}

export interface PaymentProviders2 {
    type: string;
    description: string;
    items: Items167;
}

export interface Items167 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Metadata17 {
    type: string;
    description: string;
}

export interface AdminCreateReservation {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties97;
}

export interface Properties97 {
    line_item_id: LineItemId2;
    location_id: LocationId6;
    inventory_item_id: InventoryItemId5;
    quantity: Quantity2;
    description: Description9;
    metadata: Metadata18;
}

export interface LineItemId2 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId6 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryItemId5 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity2 {
    type: string;
    title: string;
    description: string;
}

export interface Description9 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata18 {
    type: string;
    description: string;
}

export interface AdminCreateReturnReason {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties98;
}

export interface Properties98 {
    value: Value6;
    label: Label2;
    description: Description10;
    parent_return_reason_id: ParentReturnReasonId;
    metadata: Metadata19;
}

export interface Value6 {
    type: string;
    title: string;
    description: string;
}

export interface Label2 {
    type: string;
    title: string;
    description: string;
}

export interface Description10 {
    type: string;
    title: string;
    description: string;
}

export interface ParentReturnReasonId {
    type: string;
    title: string;
    description: string;
}

export interface Metadata19 {
    type: string;
    description: string;
}

export interface AdminCreateSalesChannel {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties99;
}

export interface Properties99 {
    name: Name6;
    description: Description11;
    is_disabled: IsDisabled;
    metadata: Metadata20;
}

export interface Name6 {
    type: string;
    title: string;
    description: string;
}

export interface Description11 {
    type: string;
    title: string;
    description: string;
}

export interface IsDisabled {
    type: string;
    title: string;
    description: string;
}

export interface Metadata20 {
    type: string;
    description: string;
}

export interface AdminCreateShipment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties100;
}

export interface Properties100 {
    labels: Labels2;
}

export interface Labels2 {
    type: string;
    description: string;
    items: Items168;
}

export interface Items168 {
    type: string;
    description: string;
    required: string[];
    properties: Properties101;
}

export interface Properties101 {
    tracking_number: TrackingNumber2;
    tracking_url: TrackingUrl2;
    label_url: LabelUrl2;
}

export interface TrackingNumber2 {
    type: string;
    title: string;
    description: string;
}

export interface TrackingUrl2 {
    type: string;
    title: string;
    description: string;
}

export interface LabelUrl2 {
    type: string;
    title: string;
    description: string;
}

export interface AdminCreateShippingOption {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties102;
}

export interface Properties102 {
    name: Name7;
    service_zone_id: ServiceZoneId;
    shipping_profile_id: ShippingProfileId3;
    data: Data4;
    price_type: PriceType;
    provider_id: ProviderId2;
    type: Type9;
    prices: Prices4;
    rules: Rules4;
}

export interface Name7 {
    type: string;
    title: string;
    description: string;
}

export interface ServiceZoneId {
    type: string;
    title: string;
    description: string;
}

export interface ShippingProfileId3 {
    type: string;
    title: string;
    description: string;
}

export interface Data4 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs85 {
    url: string;
}

export interface PriceType {
    type: string;
    description: string;
    enum: string[];
}

export interface ProviderId2 {
    type: string;
    title: string;
    description: string;
}

export interface Type9 {
    $ref: string;
}

export interface Prices4 {
    type: string;
    description: string;
    items: Items169;
}

export interface Items169 {
    oneOf: OneOf34[];
}

export interface OneOf34 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties103;
}

export interface Properties103 {
    currency_code?: CurrencyCode6;
    amount: Amount3;
    region_id?: RegionId2;
}

export interface CurrencyCode6 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Amount3 {
    type: string;
    title: string;
    description: string;
}

export interface RegionId2 {
    type: string;
    title: string;
    description: string;
}

export interface Rules4 {
    type: string;
    description: string;
    items: Items170;
}

export interface Items170 {
    $ref: string;
}

export interface AdminCreateShippingOptionRule {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties104;
}

export interface Properties104 {
    operator: Operator2;
    attribute: Attribute3;
    value: Value7;
}

export interface Operator2 {
    type: string;
    description: string;
    enum: string[];
}

export interface Attribute3 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Value7 {
    oneOf: OneOf35[];
}

export interface OneOf35 {
    type: string;
    title?: string;
    description: string;
    example?: string;
    items?: Items171;
}

export interface Items171 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface AdminCreateShippingOptionType {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties105;
}

export interface Properties105 {
    label: Label3;
    description: Description12;
    code: Code;
}

export interface Label3 {
    type: string;
    title: string;
    description: string;
}

export interface Description12 {
    type: string;
    title: string;
    description: string;
}

export interface Code {
    type: string;
    title: string;
    description: string;
}

export interface AdminCreateShippingProfile {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties106;
}

export interface Properties106 {
    name: Name8;
    type: Type10;
    metadata: Metadata21;
}

export interface Name8 {
    type: string;
    title: string;
    description: string;
}

export interface Type10 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata21 {
    type: string;
    description: string;
}

export interface AdminCreateStockLocation {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties107;
}

export interface Properties107 {
    name: Name9;
    address_id: AddressId;
    address: Address;
    metadata: Metadata22;
}

export interface Name9 {
    type: string;
    title: string;
    description: string;
}

export interface AddressId {
    type: string;
    title: string;
    description: string;
}

export interface Address {
    $ref: string;
}

export interface Metadata22 {
    type: string;
    description: string;
}

export interface AdminCreateTaxRate {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties108;
}

export interface Properties108 {
    name: Name10;
    tax_region_id: TaxRegionId;
    rate: Rate;
    code: Code2;
    rules: Rules5;
    is_default: IsDefault;
    is_combinable: IsCombinable;
    metadata: Metadata23;
}

export interface Name10 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface TaxRegionId {
    type: string;
    title: string;
    description: string;
}

export interface Rate {
    type: string;
    title: string;
    description: string;
    example: number;
}

export interface Code2 {
    type: string;
    title: string;
    description: string;
}

export interface Rules5 {
    type: string;
    description: string;
    items: Items172;
}

export interface Items172 {
    $ref: string;
}

export interface IsDefault {
    type: string;
    title: string;
    description: string;
}

export interface IsCombinable {
    type: string;
    title: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs86 {
    url: string;
}

export interface Metadata23 {
    type: string;
    description: string;
}

export interface AdminCreateTaxRateRule {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties109;
}

export interface Properties109 {
    reference: Reference;
    reference_id: ReferenceId;
}

export interface Reference {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ReferenceId {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface AdminCreateTaxRegion {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties110;
}

export interface Properties110 {
    country_code: CountryCode4;
    province_code: ProvinceCode;
    parent_id: ParentId;
    default_tax_rate: DefaultTaxRate;
    metadata: Metadata25;
}

export interface CountryCode4 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ProvinceCode {
    type: string;
    title: string;
    description: string;
}

export interface ParentId {
    type: string;
    title: string;
    description: string;
}

export interface DefaultTaxRate {
    type: string;
    description: string;
    required: string[];
    properties: Properties111;
}

export interface Properties111 {
    rate: Rate2;
    code: Code3;
    name: Name11;
    is_combinable: IsCombinable2;
    metadata: Metadata24;
}

export interface Rate2 {
    type: string;
    title: string;
    description: string;
    example: number;
}

export interface Code3 {
    type: string;
    title: string;
    description: string;
}

export interface Name11 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface IsCombinable2 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs87 {
    url: string;
}

export interface Metadata24 {
    type: string;
    description: string;
}

export interface Metadata25 {
    type: string;
    description: string;
}

export interface AdminCreateVariantInventoryItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties112;
}

export interface Properties112 {
    required_quantity: RequiredQuantity2;
    inventory_item_id: InventoryItemId6;
}

export interface RequiredQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryItemId6 {
    type: string;
    title: string;
    description: string;
}

export interface AdminCreateWorkflowsAsyncResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties113;
}

export interface Properties113 {
    transaction_id: TransactionId;
    step_id: StepId;
    response: Response;
    compensate_input: CompensateInput;
    action: Action;
}

export interface TransactionId {
    type: string;
    title: string;
    description: string;
}

export interface StepId {
    type: string;
    title: string;
    description: string;
}

export interface Response {
    description: string;
}

export interface CompensateInput {
    description: string;
}

export interface Action {
    type: string;
    description: string;
    enum: string[];
}

export interface AdminCreateWorkflowsRun {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties114;
}

export interface Properties114 {
    input: Input;
    transaction_id: TransactionId2;
}

export interface Input {
    description: string;
}

export interface TransactionId2 {
    type: string;
    title: string;
    description: string;
}

export interface AdminCurrency {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties115;
}

export interface Properties115 {
    code: Code4;
    symbol: symbol;
    symbol_native: SymbolNative;
    name: Name12;
    decimal_digits: DecimalDigits;
    rounding: Rounding;
    created_at: CreatedAt5;
    updated_at: UpdatedAt5;
    deleted_at: DeletedAt5;
}

export interface Code4 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Symbol {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface SymbolNative {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Name12 {
    type: string;
    title: string;
    description: string;
}

export interface DecimalDigits {
    type: string;
    title: string;
    description: string;
}

export interface Rounding {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt5 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt5 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt5 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminCurrencyListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties116;
}

export interface Properties116 {
    limit: Limit10;
    offset: Offset9;
    count: Count9;
    currencies: Currencies;
}

export interface Limit10 {
    type: string;
    title: string;
    description: string;
}

export interface Offset9 {
    type: string;
    title: string;
    description: string;
}

export interface Count9 {
    type: string;
    title: string;
    description: string;
}

export interface Currencies {
    type: string;
    description: string;
    items: Items173;
}

export interface Items173 {
    $ref: string;
}

export interface AdminCurrencyResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties117;
}

export interface Properties117 {
    currency: Currency2;
}

export interface Currency2 {
    $ref: string;
}

export interface AdminCustomer {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties118;
}

export interface Properties118 {
    id: Id21;
    has_account: HasAccount;
    groups: Groups;
    email: Email;
    default_billing_address_id: DefaultBillingAddressId;
    default_shipping_address_id: DefaultShippingAddressId;
    company_name: CompanyName;
    first_name: FirstName4;
    last_name: LastName4;
    addresses: Addresses;
    phone: Phone4;
    metadata: Metadata26;
    created_by: CreatedBy3;
    created_at: CreatedAt6;
    updated_at: UpdatedAt6;
    deleted_at: DeletedAt6;
}

export interface Id21 {
    type: string;
    title: string;
    description: string;
}

export interface HasAccount {
    type: string;
    title: string;
    description: string;
}

export interface Groups {
    type: string;
    description: string;
    items: Items174;
}

export interface Items174 {
    $ref: string;
}

export interface Email {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DefaultBillingAddressId {
    type: string;
    title: string;
    description: string;
}

export interface DefaultShippingAddressId {
    type: string;
    title: string;
    description: string;
}

export interface CompanyName {
    type: string;
    title: string;
    description: string;
}

export interface FirstName4 {
    type: string;
    title: string;
    description: string;
}

export interface LastName4 {
    type: string;
    title: string;
    description: string;
}

export interface Addresses {
    type: string;
    description: string;
    items: Items175;
}

export interface Items175 {
    $ref: string;
}

export interface Phone4 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata26 {
    type: string;
    description: string;
}

export interface CreatedBy3 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt6 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt6 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt6 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminCustomerAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties119;
}

export interface Properties119 {
    id: Id22;
    address_name: AddressName3;
    is_default_shipping: IsDefaultShipping3;
    is_default_billing: IsDefaultBilling3;
    customer_id: CustomerId;
    company: Company4;
    first_name: FirstName5;
    last_name: LastName5;
    address_1: Address14;
    address_2: Address24;
    city: City4;
    country_code: CountryCode5;
    province: Province4;
    postal_code: PostalCode4;
    phone: Phone5;
    metadata: Metadata27;
    created_at: CreatedAt7;
    updated_at: UpdatedAt7;
}

export interface Id22 {
    type: string;
    title: string;
    description: string;
}

export interface AddressName3 {
    type: string;
    title: string;
    description: string;
}

export interface IsDefaultShipping3 {
    type: string;
    title: string;
    description: string;
}

export interface IsDefaultBilling3 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId {
    type: string;
    title: string;
    description: string;
}

export interface Company4 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName5 {
    type: string;
    title: string;
    description: string;
}

export interface LastName5 {
    type: string;
    title: string;
    description: string;
}

export interface Address14 {
    type: string;
    title: string;
    description: string;
}

export interface Address24 {
    type: string;
    title: string;
    description: string;
}

export interface City4 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode5 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Province4 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode4 {
    type: string;
    title: string;
    description: string;
}

export interface Phone5 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata27 {
    type: string;
    description: string;
}

export interface CreatedAt7 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt7 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminCustomerAddressResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties120;
}

export interface Properties120 {
    address: Address3;
}

export interface Address3 {
    $ref: string;
}

export interface AdminCustomerGroup {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties121;
}

export interface Properties121 {
    id: Id23;
    name: Name13;
    customers: Customers;
    metadata: Metadata28;
    created_at: CreatedAt8;
    updated_at: UpdatedAt8;
}

export interface Id23 {
    type: string;
    title: string;
    description: string;
}

export interface Name13 {
    type: string;
    title: string;
    description: string;
}

export interface Customers {
    type: string;
    description: string;
    items: Items176;
}

export interface Items176 {
    type: string;
}

export interface Metadata28 {
    type: string;
    description: string;
}

export interface CreatedAt8 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt8 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminCustomerGroupResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties122;
}

export interface Properties122 {
    customer_group: CustomerGroup;
}

export interface CustomerGroup {
    $ref: string;
}

export interface AdminCustomerInGroupFilters {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties123;
}

export interface Properties123 {
    id: Id24;
    email: Email2;
    default_billing_address_id: DefaultBillingAddressId2;
    default_shipping_address_id: DefaultShippingAddressId2;
    company_name: CompanyName2;
    first_name: FirstName6;
    last_name: LastName6;
    created_by: CreatedBy4;
    created_at: CreatedAt9;
    updated_at: UpdatedAt9;
    deleted_at: DeletedAt7;
}

export interface Id24 {
    oneOf: OneOf36[];
}

export interface OneOf36 {
    type: string;
    title?: string;
    description: string;
    items?: Items177;
}

export interface Items177 {
    type: string;
    title: string;
    description: string;
}

export interface Email2 {
    oneOf: OneOf37[];
}

export interface OneOf37 {
    type: string;
    title?: string;
    description: string;
    format?: string;
    items?: Items178;
    properties?: Properties124;
}

export interface Items178 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface Properties124 {
    $and: And11;
    $or: Or11;
    $eq: Eq11;
    $ne: Ne11;
    $in: In11;
    $nin: Nin11;
    $not: Not11;
    $gt: Gt11;
    $gte: Gte11;
    $lt: Lt11;
    $lte: Lte11;
    $like: Like11;
    $re: Re11;
    $ilike: Ilike11;
    $fulltext: Fulltext11;
    $overlap: Overlap11;
    $contains: Contains11;
    $contained: Contained11;
    $exists: Exists11;
}

export interface And11 {
    type: string;
    description: string;
    items: Items179;
    title: string;
}

export interface Items179 {
    type: string;
}

export interface Or11 {
    type: string;
    description: string;
    items: Items180;
    title: string;
}

export interface Items180 {
    type: string;
}

export interface Eq11 {
    oneOf: OneOf38[];
}

export interface OneOf38 {
    type: string;
    title?: string;
    description: string;
    items?: Items181;
}

export interface Items181 {
    type: string;
    title: string;
    description: string;
}

export interface Ne11 {
    type: string;
    title: string;
    description: string;
}

export interface In11 {
    type: string;
    description: string;
    items: Items182;
}

export interface Items182 {
    type: string;
    title: string;
    description: string;
}

export interface Nin11 {
    type: string;
    description: string;
    items: Items183;
}

export interface Items183 {
    type: string;
    title: string;
    description: string;
}

export interface Not11 {
    oneOf: OneOf39[];
}

export interface OneOf39 {
    type: string;
    title?: string;
    description: string;
    items?: Items184;
}

export interface Items184 {
    type: string;
    title: string;
    description: string;
}

export interface Gt11 {
    type: string;
    title: string;
    description: string;
}

export interface Gte11 {
    type: string;
    title: string;
    description: string;
}

export interface Lt11 {
    type: string;
    title: string;
    description: string;
}

export interface Lte11 {
    type: string;
    title: string;
    description: string;
}

export interface Like11 {
    type: string;
    title: string;
    description: string;
}

export interface Re11 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike11 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext11 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap11 {
    type: string;
    description: string;
    items: Items185;
}

export interface Items185 {
    type: string;
    title: string;
    description: string;
}

export interface Contains11 {
    type: string;
    description: string;
    items: Items186;
}

export interface Items186 {
    type: string;
    title: string;
    description: string;
}

export interface Contained11 {
    type: string;
    description: string;
    items: Items187;
}

export interface Items187 {
    type: string;
    title: string;
    description: string;
}

export interface Exists11 {
    type: string;
    title: string;
    description: string;
}

export interface DefaultBillingAddressId2 {
    oneOf: OneOf40[];
}

export interface OneOf40 {
    type: string;
    title?: string;
    description: string;
    items?: Items188;
}

export interface Items188 {
    type: string;
    title: string;
    description: string;
}

export interface DefaultShippingAddressId2 {
    oneOf: OneOf41[];
}

export interface OneOf41 {
    type: string;
    title?: string;
    description: string;
    items?: Items189;
}

export interface Items189 {
    type: string;
    title: string;
    description: string;
}

export interface CompanyName2 {
    oneOf: OneOf42[];
}

export interface OneOf42 {
    type: string;
    title?: string;
    description: string;
    items?: Items190;
}

export interface Items190 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName6 {
    oneOf: OneOf43[];
}

export interface OneOf43 {
    type: string;
    title?: string;
    description: string;
    items?: Items191;
}

export interface Items191 {
    type: string;
    title: string;
    description: string;
}

export interface LastName6 {
    oneOf: OneOf44[];
}

export interface OneOf44 {
    type: string;
    title?: string;
    description: string;
    items?: Items192;
}

export interface Items192 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedBy4 {
    oneOf: OneOf45[];
}

export interface OneOf45 {
    type: string;
    title?: string;
    description: string;
    items?: Items193;
}

export interface Items193 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt9 {
    type: string;
    description: string;
    properties: Properties125;
}

export interface Properties125 {
    $and: And12;
    $or: Or12;
    $eq: Eq12;
    $ne: Ne12;
    $in: In12;
    $nin: Nin12;
    $not: Not12;
    $gt: Gt12;
    $gte: Gte12;
    $lt: Lt12;
    $lte: Lte12;
    $like: Like12;
    $re: Re12;
    $ilike: Ilike12;
    $fulltext: Fulltext12;
    $overlap: Overlap12;
    $contains: Contains12;
    $contained: Contained12;
    $exists: Exists12;
}

export interface And12 {
    type: string;
    description: string;
    items: Items194;
    title: string;
}

export interface Items194 {
    type: string;
}

export interface Or12 {
    type: string;
    description: string;
    items: Items195;
    title: string;
}

export interface Items195 {
    type: string;
}

export interface Eq12 {
    oneOf: OneOf46[];
}

export interface OneOf46 {
    type: string;
    title?: string;
    description: string;
    items?: Items196;
}

export interface Items196 {
    type: string;
    title: string;
    description: string;
}

export interface Ne12 {
    type: string;
    title: string;
    description: string;
}

export interface In12 {
    type: string;
    description: string;
    items: Items197;
}

export interface Items197 {
    type: string;
    title: string;
    description: string;
}

export interface Nin12 {
    type: string;
    description: string;
    items: Items198;
}

export interface Items198 {
    type: string;
    title: string;
    description: string;
}

export interface Not12 {
    oneOf: OneOf47[];
}

export interface OneOf47 {
    type: string;
    title?: string;
    description: string;
    items?: Items199;
}

export interface Items199 {
    type: string;
    title: string;
    description: string;
}

export interface Gt12 {
    type: string;
    title: string;
    description: string;
}

export interface Gte12 {
    type: string;
    title: string;
    description: string;
}

export interface Lt12 {
    type: string;
    title: string;
    description: string;
}

export interface Lte12 {
    type: string;
    title: string;
    description: string;
}

export interface Like12 {
    type: string;
    title: string;
    description: string;
}

export interface Re12 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike12 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext12 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap12 {
    type: string;
    description: string;
    items: Items200;
}

export interface Items200 {
    type: string;
    title: string;
    description: string;
}

export interface Contains12 {
    type: string;
    description: string;
    items: Items201;
}

export interface Items201 {
    type: string;
    title: string;
    description: string;
}

export interface Contained12 {
    type: string;
    description: string;
    items: Items202;
}

export interface Items202 {
    type: string;
    title: string;
    description: string;
}

export interface Exists12 {
    type: string;
    title: string;
    description: string;
}

export interface UpdatedAt9 {
    type: string;
    description: string;
    properties: Properties126;
}

export interface Properties126 {
    $and: And13;
    $or: Or13;
    $eq: Eq13;
    $ne: Ne13;
    $in: In13;
    $nin: Nin13;
    $not: Not13;
    $gt: Gt13;
    $gte: Gte13;
    $lt: Lt13;
    $lte: Lte13;
    $like: Like13;
    $re: Re13;
    $ilike: Ilike13;
    $fulltext: Fulltext13;
    $overlap: Overlap13;
    $contains: Contains13;
    $contained: Contained13;
    $exists: Exists13;
}

export interface And13 {
    type: string;
    description: string;
    items: Items203;
    title: string;
}

export interface Items203 {
    type: string;
}

export interface Or13 {
    type: string;
    description: string;
    items: Items204;
    title: string;
}

export interface Items204 {
    type: string;
}

export interface Eq13 {
    oneOf: OneOf48[];
}

export interface OneOf48 {
    type: string;
    title?: string;
    description: string;
    items?: Items205;
}

export interface Items205 {
    type: string;
    title: string;
    description: string;
}

export interface Ne13 {
    type: string;
    title: string;
    description: string;
}

export interface In13 {
    type: string;
    description: string;
    items: Items206;
}

export interface Items206 {
    type: string;
    title: string;
    description: string;
}

export interface Nin13 {
    type: string;
    description: string;
    items: Items207;
}

export interface Items207 {
    type: string;
    title: string;
    description: string;
}

export interface Not13 {
    oneOf: OneOf49[];
}

export interface OneOf49 {
    type: string;
    title?: string;
    description: string;
    items?: Items208;
}

export interface Items208 {
    type: string;
    title: string;
    description: string;
}

export interface Gt13 {
    type: string;
    title: string;
    description: string;
}

export interface Gte13 {
    type: string;
    title: string;
    description: string;
}

export interface Lt13 {
    type: string;
    title: string;
    description: string;
}

export interface Lte13 {
    type: string;
    title: string;
    description: string;
}

export interface Like13 {
    type: string;
    title: string;
    description: string;
}

export interface Re13 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike13 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext13 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap13 {
    type: string;
    description: string;
    items: Items209;
}

export interface Items209 {
    type: string;
    title: string;
    description: string;
}

export interface Contains13 {
    type: string;
    description: string;
    items: Items210;
}

export interface Items210 {
    type: string;
    title: string;
    description: string;
}

export interface Contained13 {
    type: string;
    description: string;
    items: Items211;
}

export interface Items211 {
    type: string;
    title: string;
    description: string;
}

export interface Exists13 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt7 {
    type: string;
    description: string;
    properties: Properties127;
}

export interface Properties127 {
    $and: And14;
    $or: Or14;
    $eq: Eq14;
    $ne: Ne14;
    $in: In14;
    $nin: Nin14;
    $not: Not14;
    $gt: Gt14;
    $gte: Gte14;
    $lt: Lt14;
    $lte: Lte14;
    $like: Like14;
    $re: Re14;
    $ilike: Ilike14;
    $fulltext: Fulltext14;
    $overlap: Overlap14;
    $contains: Contains14;
    $contained: Contained14;
    $exists: Exists14;
}

export interface And14 {
    type: string;
    description: string;
    items: Items212;
    title: string;
}

export interface Items212 {
    type: string;
}

export interface Or14 {
    type: string;
    description: string;
    items: Items213;
    title: string;
}

export interface Items213 {
    type: string;
}

export interface Eq14 {
    oneOf: OneOf50[];
}

export interface OneOf50 {
    type: string;
    title?: string;
    description: string;
    items?: Items214;
}

export interface Items214 {
    type: string;
    title: string;
    description: string;
}

export interface Ne14 {
    type: string;
    title: string;
    description: string;
}

export interface In14 {
    type: string;
    description: string;
    items: Items215;
}

export interface Items215 {
    type: string;
    title: string;
    description: string;
}

export interface Nin14 {
    type: string;
    description: string;
    items: Items216;
}

export interface Items216 {
    type: string;
    title: string;
    description: string;
}

export interface Not14 {
    oneOf: OneOf51[];
}

export interface OneOf51 {
    type: string;
    title?: string;
    description: string;
    items?: Items217;
}

export interface Items217 {
    type: string;
    title: string;
    description: string;
}

export interface Gt14 {
    type: string;
    title: string;
    description: string;
}

export interface Gte14 {
    type: string;
    title: string;
    description: string;
}

export interface Lt14 {
    type: string;
    title: string;
    description: string;
}

export interface Lte14 {
    type: string;
    title: string;
    description: string;
}

export interface Like14 {
    type: string;
    title: string;
    description: string;
}

export interface Re14 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike14 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext14 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap14 {
    type: string;
    description: string;
    items: Items218;
}

export interface Items218 {
    type: string;
    title: string;
    description: string;
}

export interface Contains14 {
    type: string;
    description: string;
    items: Items219;
}

export interface Items219 {
    type: string;
    title: string;
    description: string;
}

export interface Contained14 {
    type: string;
    description: string;
    items: Items220;
}

export interface Items220 {
    type: string;
    title: string;
    description: string;
}

export interface Exists14 {
    type: string;
    title: string;
    description: string;
}

export interface AdminCustomerResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties128;
}

export interface Properties128 {
    customer: Customer;
}

export interface Customer {
    $ref: string;
}

export interface AdminDeletePaymentCollectionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties129;
}

export interface Properties129 {
    id: Id25;
    object: Object7;
    deleted: Deleted10;
}

export interface Id25 {
    type: string;
    title: string;
    description: string;
}

export interface Object7 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted10 {
    type: string;
    title: string;
    description: string;
}

export interface AdminDraftOrder {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties130;
}

export interface Properties130 {
    payment_collections: PaymentCollections;
    fulfillments: Fulfillments;
    sales_channel: SalesChannel;
    customer: Customer2;
    shipping_address: ShippingAddress;
    billing_address: BillingAddress;
    items: Items223;
    shipping_methods: ShippingMethods2;
    status: Status4;
    currency_code: CurrencyCode7;
    id: Id26;
    version: Version;
    region_id: RegionId3;
    customer_id: CustomerId2;
    sales_channel_id: SalesChannelId;
    email: Email3;
    display_id: DisplayId2;
    payment_status: PaymentStatus;
    fulfillment_status: FulfillmentStatus;
    transactions: Transactions2;
    summary: Summary;
    metadata: Metadata29;
    created_at: CreatedAt10;
    updated_at: UpdatedAt10;
    original_item_total: OriginalItemTotal;
    original_item_subtotal: OriginalItemSubtotal;
    original_item_tax_total: OriginalItemTaxTotal;
    item_total: ItemTotal;
    item_subtotal: ItemSubtotal;
    item_tax_total: ItemTaxTotal;
    original_total: OriginalTotal;
    original_subtotal: OriginalSubtotal;
    original_tax_total: OriginalTaxTotal;
    total: Total;
    subtotal: Subtotal;
    tax_total: TaxTotal;
    discount_total: DiscountTotal;
    discount_tax_total: DiscountTaxTotal;
    gift_card_total: GiftCardTotal;
    gift_card_tax_total: GiftCardTaxTotal;
    shipping_total: ShippingTotal;
    shipping_subtotal: ShippingSubtotal;
    shipping_tax_total: ShippingTaxTotal;
    original_shipping_total: OriginalShippingTotal;
    original_shipping_subtotal: OriginalShippingSubtotal;
    original_shipping_tax_total: OriginalShippingTaxTotal;
}

export interface PaymentCollections {
    type: string;
    description: string;
    items: Items221;
}

export interface Items221 {
    $ref: string;
}

export interface Fulfillments {
    type: string;
    description: string;
    items: Items222;
}

export interface Items222 {
    $ref: string;
}

export interface SalesChannel {
    $ref: string;
}

export interface Customer2 {
    $ref: string;
}

export interface ShippingAddress {
    $ref: string;
}

export interface BillingAddress {
    $ref: string;
}

export interface Items223 {
    type: string;
    description: string;
    items: Items224;
}

export interface Items224 {
    $ref: string;
}

export interface ShippingMethods2 {
    type: string;
    description: string;
    items: Items225;
}

export interface Items225 {
    $ref: string;
}

export interface Status4 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode7 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Id26 {
    type: string;
    title: string;
    description: string;
}

export interface Version {
    type: string;
    title: string;
    description: string;
}

export interface RegionId3 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId2 {
    type: string;
    title: string;
    description: string;
}

export interface SalesChannelId {
    type: string;
    title: string;
    description: string;
}

export interface Email3 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DisplayId2 {
    type: string;
    title: string;
    description: string;
}

export interface PaymentStatus {
    type: string;
    description: string;
    enum: string[];
}

export interface FulfillmentStatus {
    type: string;
    description: string;
    enum: string[];
}

export interface Transactions2 {
    type: string;
    description: string;
    items: Items226;
}

export interface Items226 {
    $ref: string;
}

export interface Summary {
    $ref: string;
}

export interface Metadata29 {
    type: string;
    description: string;
}

export interface CreatedAt10 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt10 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalItemTotal {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemSubtotal {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemTaxTotal {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTotal {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal {
    type: string;
    title: string;
    description: string;
}

export interface Total {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTotal {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTaxTotal {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTotal {
    type: string;
    title: string;
    description: string;
}

export interface ShippingSubtotal {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTaxTotal {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTotal {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingSubtotal {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTaxTotal {
    type: string;
    title: string;
    description: string;
}

export interface AdminDraftOrderListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties131;
}

export interface Properties131 {
    limit: Limit11;
    offset: Offset10;
    count: Count10;
    draft_orders: DraftOrders;
}

export interface Limit11 {
    type: string;
    title: string;
    description: string;
}

export interface Offset10 {
    type: string;
    title: string;
    description: string;
}

export interface Count10 {
    type: string;
    title: string;
    description: string;
}

export interface DraftOrders {
    type: string;
    description: string;
    items: Items227;
}

export interface Items227 {
    $ref: string;
}

export interface AdminDraftOrderResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties132;
}

export interface Properties132 {
    draft_order: DraftOrder;
}

export interface DraftOrder {
    $ref: string;
}

export interface AdminExchange {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties133;
}

export interface Properties133 {
    order_id: OrderId3;
    return_items: ReturnItems;
    additional_items: AdditionalItems2;
    no_notification: NoNotification2;
    difference_due: DifferenceDue;
    return: Return4;
    return_id: ReturnId2;
    id: Id27;
    display_id: DisplayId3;
    shipping_methods: ShippingMethods3;
    transactions: Transactions3;
    metadata: Metadata30;
    created_at: CreatedAt11;
    updated_at: UpdatedAt11;
    order_version: OrderVersion2;
    created_by: CreatedBy5;
    canceled_at: CanceledAt3;
    deleted_at: DeletedAt8;
    order: Order4;
    allow_backorder: AllowBackorder3;
}

export interface OrderId3 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnItems {
    type: string;
    description: string;
    items: Items228;
}

export interface Items228 {
    $ref: string;
}

export interface AdditionalItems2 {
    type: string;
    description: string;
    items: Items229;
}

export interface Items229 {
    $ref: string;
}

export interface NoNotification2 {
    type: string;
    title: string;
    description: string;
}

export interface DifferenceDue {
    type: string;
    title: string;
    description: string;
}

export interface Return4 {
    $ref: string;
}

export interface ReturnId2 {
    type: string;
    title: string;
    description: string;
}

export interface Id27 {
    type: string;
    title: string;
    description: string;
}

export interface DisplayId3 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethods3 {
    type: string;
    description: string;
    items: Items230;
}

export interface Items230 {
    $ref: string;
}

export interface Transactions3 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
    items: Items231;
}

export interface ExternalDocs88 {
    url: string;
}

export interface Items231 {
    $ref: string;
}

export interface Metadata30 {
    type: string;
    description: string;
}

export interface CreatedAt11 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt11 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OrderVersion2 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedBy5 {
    type: string;
    title: string;
    description: string;
}

export interface CanceledAt3 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DeletedAt8 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Order4 {
    $ref: string;
}

export interface AllowBackorder3 {
    type: string;
    title: string;
    description: string;
}

export interface AdminExchangeDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties134;
}

export interface Properties134 {
    id: Id28;
    object: Object8;
    deleted: Deleted11;
}

export interface Id28 {
    type: string;
    title: string;
    description: string;
}

export interface Object8 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted11 {
    type: string;
    title: string;
    description: string;
}

export interface AdminExchangeOrderResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties135;
}

export interface Properties135 {
    order: Order5;
    exchange: Exchange;
}

export interface Order5 {
    $ref: string;
}

export interface Exchange {
    $ref: string;
}

export interface AdminExchangePreviewResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties136;
}

export interface Properties136 {
    order_preview: OrderPreview4;
    exchange: Exchange2;
}

export interface OrderPreview4 {
    $ref: string;
}

export interface Exchange2 {
    $ref: string;
}

export interface AdminExchangeRequestResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties137;
}

export interface Properties137 {
    return: Return5;
    order_preview: OrderPreview5;
    exchange: Exchange3;
}

export interface Return5 {
    $ref: string;
}

export interface OrderPreview5 {
    $ref: string;
}

export interface Exchange3 {
    $ref: string;
}

export interface AdminExchangeResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties138;
}

export interface Properties138 {
    exchange: Exchange4;
}

export interface Exchange4 {
    $ref: string;
}

export interface AdminExchangeReturnResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties139;
}

export interface Properties139 {
    order_preview: OrderPreview6;
    return: Return6;
}

export interface OrderPreview6 {
    $ref: string;
}

export interface Return6 {
    $ref: string;
}

export interface AdminExportProductResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties140;
}

export interface Properties140 {
    transaction_id: TransactionId3;
}

export interface TransactionId3 {
    type: string;
    title: string;
    description: string;
}

export interface AdminFile {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties141;
}

export interface Properties141 {
    id: Id29;
    url: Url3;
}

export interface Id29 {
    type: string;
    title: string;
    description: string;
}

export interface Url3 {
    type: string;
    title: string;
    description: string;
}

export interface AdminFileListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties142;
}

export interface Properties142 {
    files: Files;
}

export interface Files {
    type: string;
    description: string;
    items: Items232;
}

export interface Items232 {
    $ref: string;
}

export interface AdminFileResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties143;
}

export interface Properties143 {
    file: File;
}

export interface File {
    $ref: string;
}

export interface AdminFulfillment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties144;
}

export interface Properties144 {
    id: Id30;
    location_id: LocationId7;
    provider_id: ProviderId3;
    shipping_option_id: ShippingOptionId2;
    provider: Provider;
    delivery_address: DeliveryAddress2;
    items: Items233;
    labels: Labels3;
    packed_at: PackedAt2;
    shipped_at: ShippedAt2;
    delivered_at: DeliveredAt2;
    canceled_at: CanceledAt4;
    data: Data5;
    metadata: Metadata31;
    created_at: CreatedAt12;
    updated_at: UpdatedAt12;
    deleted_at: DeletedAt9;
}

export interface Id30 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId7 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId3 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId2 {
    type: string;
    title: string;
    description: string;
}

export interface Provider {
    $ref: string;
}

export interface DeliveryAddress2 {
    $ref: string;
}

export interface Items233 {
    type: string;
    description: string;
    items: Items234;
}

export interface Items234 {
    $ref: string;
}

export interface Labels3 {
    type: string;
    description: string;
    items: Items235;
}

export interface Items235 {
    $ref: string;
}

export interface PackedAt2 {
    type: string;
    title: string;
    description: string;
}

export interface ShippedAt2 {
    type: string;
    title: string;
    description: string;
}

export interface DeliveredAt2 {
    type: string;
    title: string;
    description: string;
}

export interface CanceledAt4 {
    type: string;
    title: string;
    description: string;
}

export interface Data5 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs89 {
    url: string;
}

export interface Metadata31 {
    type: string;
    description: string;
}

export interface CreatedAt12 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt12 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt9 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminFulfillmentAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties145;
}

export interface Properties145 {
    id: Id31;
    fulfillment_id: FulfillmentId;
    company: Company5;
    first_name: FirstName7;
    last_name: LastName7;
    address_1: Address15;
    address_2: Address25;
    city: City5;
    country_code: CountryCode6;
    province: Province5;
    postal_code: PostalCode5;
    phone: Phone6;
    metadata: Metadata32;
    created_at: CreatedAt13;
    updated_at: UpdatedAt13;
    deleted_at: DeletedAt10;
}

export interface Id31 {
    type: string;
    title: string;
    description: string;
}

export interface FulfillmentId {
    type: string;
    title: string;
    description: string;
}

export interface Company5 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName7 {
    type: string;
    title: string;
    description: string;
}

export interface LastName7 {
    type: string;
    title: string;
    description: string;
}

export interface Address15 {
    type: string;
    title: string;
    description: string;
}

export interface Address25 {
    type: string;
    title: string;
    description: string;
}

export interface City5 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode6 {
    type: string;
    title: string;
    description: string;
}

export interface Province5 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode5 {
    type: string;
    title: string;
    description: string;
}

export interface Phone6 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata32 {
    type: string;
    description: string;
}

export interface CreatedAt13 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt13 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt10 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminFulfillmentItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties146;
}

export interface Properties146 {
    id: Id32;
    title: Title13;
    quantity: Quantity3;
    sku: Sku5;
    barcode: Barcode4;
    line_item_id: LineItemId3;
    inventory_item_id: InventoryItemId7;
    fulfillment_id: FulfillmentId2;
    created_at: CreatedAt14;
    updated_at: UpdatedAt14;
    deleted_at: DeletedAt11;
}

export interface Id32 {
    type: string;
    title: string;
    description: string;
}

export interface Title13 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity3 {
    type: string;
    title: string;
    description: string;
}

export interface Sku5 {
    type: string;
    title: string;
    description: string;
}

export interface Barcode4 {
    type: string;
    title: string;
    description: string;
}

export interface LineItemId3 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryItemId7 {
    type: string;
    title: string;
    description: string;
}

export interface FulfillmentId2 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt14 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt14 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt11 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminFulfillmentLabel {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties147;
}

export interface Properties147 {
    id: Id33;
    tracking_number: TrackingNumber3;
    tracking_url: TrackingUrl3;
    label_url: LabelUrl3;
    fulfillment_id: FulfillmentId3;
    created_at: CreatedAt15;
    updated_at: UpdatedAt15;
    deleted_at: DeletedAt12;
}

export interface Id33 {
    type: string;
    title: string;
    description: string;
}

export interface TrackingNumber3 {
    type: string;
    title: string;
    description: string;
}

export interface TrackingUrl3 {
    type: string;
    title: string;
    description: string;
}

export interface LabelUrl3 {
    type: string;
    title: string;
    description: string;
}

export interface FulfillmentId3 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt15 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt15 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt12 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminFulfillmentProvider {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties148;
}

export interface Properties148 {
    id: Id34;
    is_enabled: IsEnabled;
}

export interface Id34 {
    type: string;
    title: string;
    description: string;
}

export interface IsEnabled {
    type: string;
    title: string;
    description: string;
}

export interface AdminFulfillmentProviderListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties149;
}

export interface Properties149 {
    limit: Limit12;
    offset: Offset11;
    count: Count11;
    fulfillment_providers: FulfillmentProviders;
}

export interface Limit12 {
    type: string;
    title: string;
    description: string;
}

export interface Offset11 {
    type: string;
    title: string;
    description: string;
}

export interface Count11 {
    type: string;
    title: string;
    description: string;
}

export interface FulfillmentProviders {
    type: string;
    description: string;
    items: Items236;
}

export interface Items236 {
    $ref: string;
}

export interface AdminFulfillmentProviderOption {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties150;
}

export interface Properties150 {
    id: Id35;
    is_return: IsReturn;
}

export interface Id35 {
    type: string;
    title: string;
    description: string;
}

export interface IsReturn {
    type: string;
    title: string;
    description: string;
}

export interface AdminFulfillmentProviderOptionsListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties151;
}

export interface Properties151 {
    limit: Limit13;
    offset: Offset12;
    count: Count12;
    fulfillment_options: FulfillmentOptions;
}

export interface Limit13 {
    type: string;
    title: string;
    description: string;
}

export interface Offset12 {
    type: string;
    title: string;
    description: string;
}

export interface Count12 {
    type: string;
    title: string;
    description: string;
}

export interface FulfillmentOptions {
    type: string;
    description: string;
    items: Items237;
}

export interface Items237 {
    $ref: string;
}

export interface AdminFulfillmentResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties152;
}

export interface Properties152 {
    fulfillment: Fulfillment;
}

export interface Fulfillment {
    $ref: string;
}

export interface AdminFulfillmentSet {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties153;
}

export interface Properties153 {
    id: Id36;
    name: Name14;
    type: Type11;
    location: Location;
    service_zones: ServiceZones;
    created_at: CreatedAt16;
    updated_at: UpdatedAt16;
    deleted_at: DeletedAt13;
}

export interface Id36 {
    type: string;
    title: string;
    description: string;
}

export interface Name14 {
    type: string;
    title: string;
    description: string;
}

export interface Type11 {
    type: string;
    title: string;
    description: string;
}

export interface Location {
    $ref: string;
}

export interface ServiceZones {
    type: string;
    description: string;
    items: Items238;
}

export interface Items238 {
    $ref: string;
}

export interface CreatedAt16 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt16 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt13 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminFulfillmentSetDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties154;
}

export interface Properties154 {
    id: Id37;
    object: Object9;
    deleted: Deleted12;
}

export interface Id37 {
    type: string;
    title: string;
    description: string;
}

export interface Object9 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted12 {
    type: string;
    title: string;
    description: string;
}

export interface AdminFulfillmentSetResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties155;
}

export interface Properties155 {
    fulfillment_set: FulfillmentSet;
}

export interface FulfillmentSet {
    $ref: string;
}

export interface AdminGeoZone {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties156;
}

export interface Properties156 {
    id: Id38;
    type: Type12;
    country_code: CountryCode7;
    province_code: ProvinceCode2;
    city: City6;
    postal_expression: PostalExpression;
    created_at: CreatedAt17;
    updated_at: UpdatedAt17;
    deleted_at: DeletedAt14;
}

export interface Id38 {
    type: string;
    title: string;
    description: string;
}

export interface Type12 {
    type: string;
    description: string;
    enum: string[];
}

export interface CountryCode7 {
    type: string;
    title: string;
    description: string;
}

export interface ProvinceCode2 {
    type: string;
    title: string;
    description: string;
}

export interface City6 {
    type: string;
    title: string;
    description: string;
}

export interface PostalExpression {
    type: string;
    description: string;
}

export interface CreatedAt17 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt17 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt14 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminImportProductRequest {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties157;
}

export interface Properties157 {
    file: File2;
}

export interface File2 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
    title: string;
}

export interface ExternalDocs90 {
    url: string;
    description: string;
}

export interface AdminImportProductResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties158;
}

export interface Properties158 {
    transaction_id: TransactionId4;
    summary: Summary2;
}

export interface TransactionId4 {
    type: string;
    title: string;
    description: string;
}

export interface Summary2 {
    type: string;
    description: string;
    required: string[];
    properties: Properties159;
}

export interface Properties159 {
    toCreate: ToCreate;
    toUpdate: ToUpdate;
}

export interface ToCreate {
    type: string;
    title: string;
    description: string;
}

export interface ToUpdate {
    type: string;
    title: string;
    description: string;
}

export interface AdminInventoryItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties160;
}

export interface Properties160 {
    id: Id39;
    sku: Sku6;
    origin_country: OriginCountry6;
    hs_code: HsCode6;
    requires_shipping: RequiresShipping2;
    mid_code: MidCode6;
    material: Material6;
    weight: Weight6;
    length: Length6;
    height: Height6;
    width: Width6;
    title: Title14;
    description: Description13;
    thumbnail: Thumbnail4;
    metadata: Metadata33;
    location_levels: LocationLevels;
}

export interface Id39 {
    type: string;
    title: string;
    description: string;
}

export interface Sku6 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry6 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode6 {
    type: string;
    title: string;
    description: string;
}

export interface RequiresShipping2 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode6 {
    type: string;
    title: string;
    description: string;
}

export interface Material6 {
    type: string;
    title: string;
    description: string;
}

export interface Weight6 {
    type: string;
    title: string;
    description: string;
}

export interface Length6 {
    type: string;
    title: string;
    description: string;
}

export interface Height6 {
    type: string;
    title: string;
    description: string;
}

export interface Width6 {
    type: string;
    title: string;
    description: string;
}

export interface Title14 {
    type: string;
    title: string;
    description: string;
}

export interface Description13 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail4 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata33 {
    type: string;
    description: string;
}

export interface LocationLevels {
    type: string;
    description: string;
    items: Items239;
}

export interface Items239 {
    $ref: string;
}

export interface AdminInventoryItemResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties161;
}

export interface Properties161 {
    inventory_item: InventoryItem;
}

export interface InventoryItem {
    $ref: string;
}

export interface AdminInventoryLevel {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties162;
}

export interface Properties162 {
    id: Id40;
    created_at: CreatedAt18;
    updated_at: UpdatedAt18;
    deleted_at: DeletedAt15;
    inventory_item_id: InventoryItemId8;
    location_id: LocationId8;
    stocked_quantity: StockedQuantity5;
    reserved_quantity: ReservedQuantity;
    incoming_quantity: IncomingQuantity5;
    metadata: Metadata34;
    inventory_item: InventoryItem2;
    available_quantity: AvailableQuantity;
}

export interface Id40 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt18 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt18 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt15 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface InventoryItemId8 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId8 {
    type: string;
    title: string;
    description: string;
}

export interface StockedQuantity5 {
    type: string;
    title: string;
    description: string;
}

export interface ReservedQuantity {
    type: string;
    title: string;
    description: string;
}

export interface IncomingQuantity5 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata34 {
    type: string;
    description: string;
}

export interface InventoryItem2 {
    type: string;
}

export interface AvailableQuantity {
    type: string;
    title: string;
    description: string;
}

export interface AdminInvite {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties163;
}

export interface Properties163 {
    id: Id41;
    email: Email4;
    accepted: Accepted;
    token: Token2;
    expires_at: ExpiresAt;
    metadata: Metadata35;
    created_at: CreatedAt19;
    updated_at: UpdatedAt19;
}

export interface Id41 {
    type: string;
    title: string;
    description: string;
}

export interface Email4 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface Accepted {
    type: string;
    title: string;
    description: string;
}

export interface Token2 {
    type: string;
    title: string;
    description: string;
}

export interface ExpiresAt {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface Metadata35 {
    type: string;
    description: string;
}

export interface CreatedAt19 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt19 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminInviteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties164;
}

export interface Properties164 {
    invite: Invite;
}

export interface Invite {
    $ref: string;
}

export interface AdminLinkPriceListProducts {
    "type": string;
    "description": string;
    "properties": Properties165;
    "x-schemaName": string;
}

export interface Properties165 {
    remove: Remove;
}

export interface Remove {
    type: string;
    description: string;
    items: Items240;
}

export interface Items240 {
    type: string;
    title: string;
    description: string;
}

export interface AdminNotification {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties166;
}

export interface Properties166 {
    id: Id42;
    to: To;
    channel: Channel;
    template: Template;
    data: Data6;
    trigger_type: TriggerType;
    resource_id: ResourceId;
    resource_type: ResourceType;
    receiver_id: ReceiverId;
    original_notification_id: OriginalNotificationId;
    external_id: ExternalId3;
    provider_id: ProviderId4;
    created_at: CreatedAt20;
}

export interface Id42 {
    type: string;
    title: string;
    description: string;
}

export interface To {
    type: string;
    title: string;
    description: string;
}

export interface Channel {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Template {
    type: string;
    title: string;
    description: string;
}

export interface Data6 {
    type: string;
    description: string;
}

export interface TriggerType {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ResourceId {
    type: string;
    title: string;
    description: string;
}

export interface ResourceType {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ReceiverId {
    type: string;
    title: string;
    description: string;
}

export interface OriginalNotificationId {
    type: string;
    title: string;
    description: string;
}

export interface ExternalId3 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId4 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt20 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminNotificationListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties167;
}

export interface Properties167 {
    limit: Limit14;
    offset: Offset13;
    count: Count13;
    notifications: Notifications;
}

export interface Limit14 {
    type: string;
    title: string;
    description: string;
}

export interface Offset13 {
    type: string;
    title: string;
    description: string;
}

export interface Count13 {
    type: string;
    title: string;
    description: string;
}

export interface Notifications {
    type: string;
    description: string;
    items: Items241;
}

export interface Items241 {
    $ref: string;
}

export interface AdminNotificationResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties168;
}

export interface Properties168 {
    notification: Notification;
}

export interface Notification {
    $ref: string;
}

export interface AdminOrder {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties169;
}

export interface Properties169 {
    payment_collections: PaymentCollections2;
    fulfillments: Fulfillments2;
    sales_channel: SalesChannel2;
    customer: Customer3;
    shipping_address: ShippingAddress2;
    billing_address: BillingAddress2;
    id: Id43;
    version: Version2;
    region_id: RegionId4;
    customer_id: CustomerId3;
    sales_channel_id: SalesChannelId2;
    email: Email5;
    currency_code: CurrencyCode8;
    display_id: DisplayId4;
    items: Items244;
    shipping_methods: ShippingMethods4;
    payment_status: PaymentStatus2;
    fulfillment_status: FulfillmentStatus2;
    transactions: Transactions4;
    summary: Summary3;
    metadata: Metadata36;
    created_at: CreatedAt21;
    updated_at: UpdatedAt20;
    original_item_total: OriginalItemTotal2;
    original_item_subtotal: OriginalItemSubtotal2;
    original_item_tax_total: OriginalItemTaxTotal2;
    item_total: ItemTotal2;
    item_subtotal: ItemSubtotal2;
    item_tax_total: ItemTaxTotal2;
    original_total: OriginalTotal2;
    original_subtotal: OriginalSubtotal2;
    original_tax_total: OriginalTaxTotal2;
    total: Total2;
    subtotal: Subtotal2;
    tax_total: TaxTotal2;
    discount_total: DiscountTotal2;
    discount_tax_total: DiscountTaxTotal2;
    gift_card_total: GiftCardTotal2;
    gift_card_tax_total: GiftCardTaxTotal2;
    shipping_total: ShippingTotal2;
    shipping_subtotal: ShippingSubtotal2;
    shipping_tax_total: ShippingTaxTotal2;
    original_shipping_total: OriginalShippingTotal2;
    original_shipping_subtotal: OriginalShippingSubtotal2;
    original_shipping_tax_total: OriginalShippingTaxTotal2;
    status: Status5;
}

export interface PaymentCollections2 {
    type: string;
    description: string;
    items: Items242;
}

export interface Items242 {
    $ref: string;
}

export interface Fulfillments2 {
    type: string;
    description: string;
    items: Items243;
}

export interface Items243 {
    $ref: string;
}

export interface SalesChannel2 {
    $ref: string;
}

export interface Customer3 {
    $ref: string;
}

export interface ShippingAddress2 {
    $ref: string;
}

export interface BillingAddress2 {
    $ref: string;
}

export interface Id43 {
    type: string;
    title: string;
    description: string;
}

export interface Version2 {
    type: string;
    title: string;
    description: string;
}

export interface RegionId4 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId3 {
    type: string;
    title: string;
    description: string;
}

export interface SalesChannelId2 {
    type: string;
    title: string;
    description: string;
}

export interface Email5 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CurrencyCode8 {
    type: string;
    title: string;
    description: string;
}

export interface DisplayId4 {
    type: string;
    title: string;
    description: string;
}

export interface Items244 {
    type: string;
    description: string;
    items: Items245;
}

export interface Items245 {
    $ref: string;
}

export interface ShippingMethods4 {
    type: string;
    description: string;
    items: Items246;
}

export interface Items246 {
    $ref: string;
}

export interface PaymentStatus2 {
    type: string;
    description: string;
    enum: string[];
}

export interface FulfillmentStatus2 {
    type: string;
    description: string;
    enum: string[];
}

export interface Transactions4 {
    type: string;
    description: string;
    items: Items247;
}

export interface Items247 {
    $ref: string;
}

export interface Summary3 {
    $ref: string;
}

export interface Metadata36 {
    type: string;
    description: string;
}

export interface CreatedAt21 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt20 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalItemTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemSubtotal2 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemTaxTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal2 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal2 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface Total2 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal2 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTaxTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingSubtotal2 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTaxTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingSubtotal2 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTaxTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface Status5 {
    type: string;
    title: string;
    description: string;
}

export interface AdminOrderAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties170;
}

export interface Properties170 {
    id: Id44;
    customer_id: CustomerId4;
    first_name: FirstName8;
    last_name: LastName8;
    phone: Phone7;
    company: Company6;
    address_1: Address16;
    address_2: Address26;
    city: City7;
    country_code: CountryCode8;
    country: Country;
    province: Province6;
    postal_code: PostalCode6;
    metadata: Metadata37;
    created_at: CreatedAt22;
    updated_at: UpdatedAt21;
}

export interface Id44 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId4 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName8 {
    type: string;
    title: string;
    description: string;
}

export interface LastName8 {
    type: string;
    title: string;
    description: string;
}

export interface Phone7 {
    type: string;
    title: string;
    description: string;
}

export interface Company6 {
    type: string;
    title: string;
    description: string;
}

export interface Address16 {
    type: string;
    title: string;
    description: string;
}

export interface Address26 {
    type: string;
    title: string;
    description: string;
}

export interface City7 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode8 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Country {
    $ref: string;
}

export interface Province6 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode6 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata37 {
    type: string;
    description: string;
}

export interface CreatedAt22 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt21 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminOrderChange {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties171;
}

export interface Properties171 {
    id: Id45;
    version: Version3;
    change_type: ChangeType;
    order_id: OrderId4;
    return_id: ReturnId3;
    exchange_id: ExchangeId;
    claim_id: ClaimId;
    order: Order6;
    return_order: ReturnOrder;
    exchange: Exchange5;
    claim: Claim5;
    actions: Actions;
    status: Status6;
    requested_by: RequestedBy;
    requested_at: RequestedAt;
    confirmed_by: ConfirmedBy;
    confirmed_at: ConfirmedAt;
    declined_by: DeclinedBy;
    declined_reason: DeclinedReason;
    metadata: Metadata38;
    declined_at: DeclinedAt;
    canceled_by: CanceledBy;
    canceled_at: CanceledAt5;
    created_at: CreatedAt23;
    updated_at: UpdatedAt22;
}

export interface Id45 {
    type: string;
    title: string;
    description: string;
}

export interface Version3 {
    type: string;
    title: string;
    description: string;
}

export interface ChangeType {
    type: string;
    description: string;
    enum: string[];
}

export interface OrderId4 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId3 {
    type: string;
    title: string;
    description: string;
}

export interface ExchangeId {
    type: string;
    title: string;
    description: string;
}

export interface ClaimId {
    type: string;
    title: string;
    description: string;
}

export interface Order6 {
    $ref: string;
}

export interface ReturnOrder {
    $ref: string;
}

export interface Exchange5 {
    $ref: string;
}

export interface Claim5 {
    $ref: string;
}

export interface Actions {
    type: string;
    description: string;
    items: Items248;
}

export interface Items248 {
    $ref: string;
}

export interface Status6 {
    type: string;
    description: string;
    enum: string[];
}

export interface RequestedBy {
    type: string;
    title: string;
    description: string;
}

export interface RequestedAt {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface ConfirmedBy {
    type: string;
    title: string;
    description: string;
}

export interface ConfirmedAt {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DeclinedBy {
    type: string;
    title: string;
    description: string;
}

export interface DeclinedReason {
    type: string;
    title: string;
    description: string;
}

export interface Metadata38 {
    type: string;
    description: string;
}

export interface DeclinedAt {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CanceledBy {
    type: string;
    title: string;
    description: string;
}

export interface CanceledAt5 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CreatedAt23 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt22 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminOrderChangeAction {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties172;
}

export interface Properties172 {
    id: Id46;
    order_change_id: OrderChangeId;
    order_change: OrderChange;
    order_id: OrderId5;
    return_id: ReturnId4;
    claim_id: ClaimId2;
    exchange_id: ExchangeId2;
    order: Order7;
    reference: Reference2;
    reference_id: ReferenceId2;
    action: Action2;
    details: Details;
    internal_note: InternalNote;
    created_at: CreatedAt24;
    updated_at: UpdatedAt23;
}

export interface Id46 {
    type: string;
    title: string;
    description: string;
}

export interface OrderChangeId {
    type: string;
    title: string;
    description: string;
}

export interface OrderChange {
    type: string;
}

export interface OrderId5 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId4 {
    type: string;
    title: string;
    description: string;
}

export interface ClaimId2 {
    type: string;
    title: string;
    description: string;
}

export interface ExchangeId2 {
    type: string;
    title: string;
    description: string;
}

export interface Order7 {
    $ref: string;
}

export interface Reference2 {
    type: string;
    title: string;
    description: string;
    enum: string[];
}

export interface ReferenceId2 {
    type: string;
    title: string;
    description: string;
}

export interface Action2 {
    type: string;
    description: string;
    enum: string[];
}

export interface Details {
    type: string;
    description: string;
    example: Example7;
}

export interface Example7 {
    reference_id: number;
    quantity: number;
}

export interface InternalNote {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt24 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt23 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminOrderChangesResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties173;
}

export interface Properties173 {
    order_changes: OrderChanges;
}

export interface OrderChanges {
    type: string;
    description: string;
    items: Items249;
}

export interface Items249 {
    $ref: string;
}

export interface AdminOrderEditPreviewResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties174;
}

export interface Properties174 {
    order_preview: OrderPreview7;
}

export interface OrderPreview7 {
    $ref: string;
}

export interface AdminOrderEditResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties175;
}

export interface Properties175 {
    order_change: OrderChange2;
}

export interface OrderChange2 {
    $ref: string;
}

export interface AdminOrderFulfillment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties176;
}

export interface Properties176 {
    id: Id47;
    location_id: LocationId9;
    packed_at: PackedAt3;
    shipped_at: ShippedAt3;
    delivered_at: DeliveredAt3;
    canceled_at: CanceledAt6;
    data: Data7;
    provider_id: ProviderId5;
    shipping_option_id: ShippingOptionId3;
    metadata: Metadata39;
    created_at: CreatedAt25;
    updated_at: UpdatedAt24;
    requires_shipping: RequiresShipping3;
}

export interface Id47 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId9 {
    type: string;
    title: string;
    description: string;
}

export interface PackedAt3 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface ShippedAt3 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DeliveredAt3 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CanceledAt6 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface Data7 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs91 {
    url: string;
}

export interface ProviderId5 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId3 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata39 {
    type: string;
    description: string;
}

export interface CreatedAt25 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt24 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface RequiresShipping3 {
    type: string;
    title: string;
    description: string;
}

export interface AdminOrderItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties177;
}

export interface Properties177 {
    order_id: OrderId6;
    item_id: ItemId;
    version: Version4;
    history: History;
    item: Item;
}

export interface OrderId6 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId {
    type: string;
    title: string;
    description: string;
}

export interface Version4 {
    type: string;
    title: string;
    description: string;
}

export interface History {
    type: string;
    description: string;
    required: string[];
    properties: Properties178;
}

export interface Properties178 {
    version: Version5;
}

export interface Version5 {
    type: string;
    description: string;
    required: string[];
    properties: Properties179;
}

export interface Properties179 {
    from: From;
    to: To2;
}

export interface From {
    type: string;
    title: string;
    description: string;
}

export interface To2 {
    type: string;
    title: string;
    description: string;
}

export interface Item {
    $ref: string;
}

export interface AdminOrderLineItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties180;
}

export interface Properties180 {
    id: Id48;
    title: Title15;
    subtitle: Subtitle3;
    thumbnail: Thumbnail5;
    variant: Variant;
    variant_id: VariantId2;
    product: Product;
    product_id: ProductId;
    product_title: ProductTitle;
    product_description: ProductDescription;
    product_subtitle: ProductSubtitle;
    product_type: ProductType;
    product_collection: ProductCollection;
    product_handle: ProductHandle;
    variant_sku: VariantSku;
    variant_barcode: VariantBarcode;
    variant_title: VariantTitle;
    variant_option_values: VariantOptionValues;
    requires_shipping: RequiresShipping4;
    is_discountable: IsDiscountable;
    is_tax_inclusive: IsTaxInclusive3;
    compare_at_unit_price: CompareAtUnitPrice;
    unit_price: UnitPrice;
    quantity: Quantity4;
    tax_lines: TaxLines;
    adjustments: Adjustments;
    detail: Detail;
    created_at: CreatedAt26;
    updated_at: UpdatedAt25;
    metadata: Metadata40;
    original_total: OriginalTotal3;
    original_subtotal: OriginalSubtotal3;
    original_tax_total: OriginalTaxTotal3;
    item_total: ItemTotal3;
    item_subtotal: ItemSubtotal3;
    item_tax_total: ItemTaxTotal3;
    total: Total3;
    subtotal: Subtotal3;
    tax_total: TaxTotal3;
    discount_total: DiscountTotal3;
    discount_tax_total: DiscountTaxTotal3;
    refundable_total: RefundableTotal;
    refundable_total_per_unit: RefundableTotalPerUnit;
    product_type_id: ProductTypeId;
}

export interface Id48 {
    type: string;
    title: string;
    description: string;
}

export interface Title15 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle3 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail5 {
    type: string;
    title: string;
    description: string;
}

export interface Variant {
    $ref: string;
}

export interface VariantId2 {
    type: string;
    title: string;
    description: string;
}

export interface Product {
    $ref: string;
}

export interface ProductId {
    type: string;
    title: string;
    description: string;
}

export interface ProductTitle {
    type: string;
    title: string;
    description: string;
}

export interface ProductDescription {
    type: string;
    title: string;
    description: string;
}

export interface ProductSubtitle {
    type: string;
    title: string;
    description: string;
}

export interface ProductType {
    type: string;
    title: string;
    description: string;
}

export interface ProductCollection {
    type: string;
    title: string;
    description: string;
}

export interface ProductHandle {
    type: string;
    title: string;
    description: string;
}

export interface VariantSku {
    type: string;
    title: string;
    description: string;
}

export interface VariantBarcode {
    type: string;
    title: string;
    description: string;
}

export interface VariantTitle {
    type: string;
    title: string;
    description: string;
}

export interface VariantOptionValues {
    type: string;
    description: string;
    example: Example8;
}

export interface Example8 {
    Color: string;
}

export interface RequiresShipping4 {
    type: string;
    title: string;
    description: string;
}

export interface IsDiscountable {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive3 {
    type: string;
    title: string;
    description: string;
}

export interface CompareAtUnitPrice {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice {
    type: string;
    title: string;
    description: string;
}

export interface Quantity4 {
    type: string;
    title: string;
    description: string;
}

export interface TaxLines {
    type: string;
    description: string;
    items: Items250;
}

export interface Items250 {
    $ref: string;
}

export interface Adjustments {
    type: string;
    description: string;
    items: Items251;
}

export interface Items251 {
    $ref: string;
}

export interface Detail {
    type: string;
}

export interface CreatedAt26 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt25 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata40 {
    type: string;
    description: string;
}

export interface OriginalTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal3 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal3 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface Total3 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal3 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotal {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotalPerUnit {
    type: string;
    title: string;
    description: string;
}

export interface ProductTypeId {
    type: string;
    title: string;
    description: string;
}

export interface AdminOrderPreview {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties181;
}

export interface Properties181 {
    return_requested_total: ReturnRequestedTotal;
    order_change: OrderChange3;
    items: Items252;
    shipping_methods: ShippingMethods5;
    currency_code: CurrencyCode9;
    version: Version6;
    id: Id51;
    region_id: RegionId5;
    customer_id: CustomerId5;
    sales_channel_id: SalesChannelId3;
    email: Email6;
    display_id: DisplayId5;
    shipping_address: ShippingAddress3;
    billing_address: BillingAddress3;
    payment_collections: PaymentCollections3;
    payment_status: PaymentStatus3;
    fulfillments: Fulfillments3;
    fulfillment_status: FulfillmentStatus3;
    transactions: Transactions5;
    summary: Summary4;
    metadata: Metadata43;
    created_at: CreatedAt29;
    updated_at: UpdatedAt28;
    original_item_total: OriginalItemTotal3;
    original_item_subtotal: OriginalItemSubtotal3;
    original_item_tax_total: OriginalItemTaxTotal3;
    item_total: ItemTotal5;
    item_subtotal: ItemSubtotal5;
    item_tax_total: ItemTaxTotal5;
    original_total: OriginalTotal6;
    original_subtotal: OriginalSubtotal6;
    original_tax_total: OriginalTaxTotal6;
    total: Total6;
    subtotal: Subtotal6;
    tax_total: TaxTotal6;
    discount_total: DiscountTotal6;
    discount_tax_total: DiscountTaxTotal6;
    gift_card_total: GiftCardTotal3;
    gift_card_tax_total: GiftCardTaxTotal3;
    shipping_total: ShippingTotal3;
    shipping_subtotal: ShippingSubtotal3;
    shipping_tax_total: ShippingTaxTotal3;
    original_shipping_total: OriginalShippingTotal3;
    original_shipping_subtotal: OriginalShippingSubtotal3;
    original_shipping_tax_total: OriginalShippingTaxTotal3;
    customer: Customer4;
    sales_channel: SalesChannel3;
    status: Status7;
}

export interface ReturnRequestedTotal {
    type: string;
    title: string;
    description: string;
}

export interface OrderChange3 {
    $ref: string;
}

export interface Items252 {
    type: string;
    description: string;
    items: Items253;
}

export interface Items253 {
    allOf: AllOf11[];
}

export interface AllOf11 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties": Properties182;
}

export interface Properties182 {
    id?: Id49;
    title?: Title16;
    subtitle?: Subtitle4;
    thumbnail?: Thumbnail6;
    variant?: Variant2;
    variant_id?: VariantId3;
    product?: Product2;
    product_id?: ProductId2;
    product_title?: ProductTitle2;
    product_description?: ProductDescription2;
    product_subtitle?: ProductSubtitle2;
    product_type?: ProductType2;
    product_collection?: ProductCollection2;
    product_handle?: ProductHandle2;
    variant_sku?: VariantSku2;
    variant_barcode?: VariantBarcode2;
    variant_title?: VariantTitle2;
    variant_option_values?: VariantOptionValues2;
    requires_shipping?: RequiresShipping5;
    is_discountable?: IsDiscountable2;
    is_tax_inclusive?: IsTaxInclusive4;
    compare_at_unit_price?: CompareAtUnitPrice2;
    unit_price?: UnitPrice2;
    quantity?: Quantity5;
    tax_lines?: TaxLines2;
    adjustments?: Adjustments2;
    detail?: Detail2;
    created_at?: CreatedAt27;
    updated_at?: UpdatedAt26;
    metadata?: Metadata41;
    original_total?: OriginalTotal4;
    original_subtotal?: OriginalSubtotal4;
    original_tax_total?: OriginalTaxTotal4;
    item_total?: ItemTotal4;
    item_subtotal?: ItemSubtotal4;
    item_tax_total?: ItemTaxTotal4;
    total?: Total4;
    subtotal?: Subtotal4;
    tax_total?: TaxTotal4;
    discount_total?: DiscountTotal4;
    discount_tax_total?: DiscountTaxTotal4;
    refundable_total?: RefundableTotal2;
    refundable_total_per_unit?: RefundableTotalPerUnit2;
    actions?: Actions2;
}

export interface Id49 {
    type: string;
    title: string;
    description: string;
}

export interface Title16 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle4 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail6 {
    type: string;
    title: string;
    description: string;
}

export interface Variant2 {
    $ref: string;
}

export interface VariantId3 {
    type: string;
    title: string;
    description: string;
}

export interface Product2 {
    $ref: string;
}

export interface ProductId2 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTitle2 {
    type: string;
    title: string;
    description: string;
}

export interface ProductDescription2 {
    type: string;
    title: string;
    description: string;
}

export interface ProductSubtitle2 {
    type: string;
    title: string;
    description: string;
}

export interface ProductType2 {
    type: string;
    title: string;
    description: string;
}

export interface ProductCollection2 {
    type: string;
    title: string;
    description: string;
}

export interface ProductHandle2 {
    type: string;
    title: string;
    description: string;
}

export interface VariantSku2 {
    type: string;
    title: string;
    description: string;
}

export interface VariantBarcode2 {
    type: string;
    title: string;
    description: string;
}

export interface VariantTitle2 {
    type: string;
    title: string;
    description: string;
}

export interface VariantOptionValues2 {
    type: string;
    description: string;
}

export interface RequiresShipping5 {
    type: string;
    title: string;
    description: string;
}

export interface IsDiscountable2 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive4 {
    type: string;
    title: string;
    description: string;
}

export interface CompareAtUnitPrice2 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice2 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity5 {
    type: string;
    title: string;
    description: string;
}

export interface TaxLines2 {
    type: string;
    description: string;
    items: Items254;
}

export interface Items254 {
    $ref: string;
}

export interface Adjustments2 {
    type: string;
    description: string;
    items: Items255;
}

export interface Items255 {
    $ref: string;
}

export interface Detail2 {
    $ref: string;
}

export interface CreatedAt27 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt26 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata41 {
    type: string;
    description: string;
}

export interface OriginalTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal4 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal4 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface Total4 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal4 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotal2 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotalPerUnit2 {
    type: string;
    title: string;
    description: string;
}

export interface Actions2 {
    type: string;
    description: string;
    items: Items256;
}

export interface Items256 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ShippingMethods5 {
    type: string;
    description: string;
    items: Items257;
}

export interface Items257 {
    allOf: AllOf12[];
}

export interface AllOf12 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties": Properties183;
}

export interface Properties183 {
    id?: Id50;
    order_id?: OrderId7;
    name?: Name15;
    description?: Description14;
    amount?: Amount4;
    is_tax_inclusive?: IsTaxInclusive5;
    shipping_option_id?: ShippingOptionId4;
    data?: Data8;
    metadata?: Metadata42;
    tax_lines?: TaxLines3;
    adjustments?: Adjustments3;
    original_total?: OriginalTotal5;
    original_subtotal?: OriginalSubtotal5;
    original_tax_total?: OriginalTaxTotal5;
    total?: Total5;
    subtotal?: Subtotal5;
    tax_total?: TaxTotal5;
    discount_total?: DiscountTotal5;
    discount_tax_total?: DiscountTaxTotal5;
    created_at?: CreatedAt28;
    updated_at?: UpdatedAt27;
    actions?: Actions3;
}

export interface Id50 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId7 {
    type: string;
    title: string;
    description: string;
}

export interface Name15 {
    type: string;
    title: string;
    description: string;
}

export interface Description14 {
    type: string;
    title: string;
    description: string;
}

export interface Amount4 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive5 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId4 {
    type: string;
    title: string;
    description: string;
}

export interface Data8 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs92 {
    url: string;
}

export interface Metadata42 {
    type: string;
    description: string;
}

export interface TaxLines3 {
    type: string;
    description: string;
    items: Items258;
}

export interface Items258 {
    $ref: string;
}

export interface Adjustments3 {
    type: string;
    description: string;
    items: Items259;
}

export interface Items259 {
    $ref: string;
}

export interface OriginalTotal5 {
    oneOf: OneOf52[];
}

export interface OneOf52 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal5 {
    oneOf: OneOf53[];
}

export interface OneOf53 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal5 {
    oneOf: OneOf54[];
}

export interface OneOf54 {
    type: string;
    title: string;
    description: string;
}

export interface Total5 {
    oneOf: OneOf55[];
}

export interface OneOf55 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal5 {
    oneOf: OneOf56[];
}

export interface OneOf56 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal5 {
    oneOf: OneOf57[];
}

export interface OneOf57 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal5 {
    oneOf: OneOf58[];
}

export interface OneOf58 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal5 {
    oneOf: OneOf59[];
}

export interface OneOf59 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt28 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt27 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Actions3 {
    type: string;
    description: string;
    items: Items260;
}

export interface Items260 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface CurrencyCode9 {
    type: string;
    title: string;
    description: string;
}

export interface Version6 {
    type: string;
    title: string;
    description: string;
}

export interface Id51 {
    type: string;
    title: string;
    description: string;
}

export interface RegionId5 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId5 {
    type: string;
    title: string;
    description: string;
}

export interface SalesChannelId3 {
    type: string;
    title: string;
    description: string;
}

export interface Email6 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DisplayId5 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingAddress3 {
    $ref: string;
}

export interface BillingAddress3 {
    $ref: string;
}

export interface PaymentCollections3 {
    type: string;
    description: string;
    items: Items261;
}

export interface Items261 {
    $ref: string;
}

export interface PaymentStatus3 {
    type: string;
    description: string;
    enum: string[];
}

export interface Fulfillments3 {
    type: string;
    description: string;
    items: Items262;
}

export interface Items262 {
    $ref: string;
}

export interface FulfillmentStatus3 {
    type: string;
    description: string;
    enum: string[];
}

export interface Transactions5 {
    type: string;
    description: string;
    items: Items263;
}

export interface Items263 {
    $ref: string;
}

export interface Summary4 {
    $ref: string;
}

export interface Metadata43 {
    type: string;
    description: string;
}

export interface CreatedAt29 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt28 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalItemTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemSubtotal3 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemTaxTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal5 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal5 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal5 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal6 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface Total6 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal6 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTaxTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingSubtotal3 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTaxTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingSubtotal3 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTaxTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface Customer4 {
    $ref: string;
}

export interface SalesChannel3 {
    $ref: string;
}

export interface Status7 {
    type: string;
    title: string;
    description: string;
}

export interface AdminOrderPreviewResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties184;
}

export interface Properties184 {
    order: Order8;
}

export interface Order8 {
    $ref: string;
}

export interface AdminOrderResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties185;
}

export interface Properties185 {
    order: Order9;
}

export interface Order9 {
    $ref: string;
}

export interface AdminOrderReturnResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties186;
}

export interface Properties186 {
    order: Order10;
    return: Return7;
}

export interface Order10 {
    $ref: string;
}

export interface Return7 {
    $ref: string;
}

export interface AdminOrderShippingMethod {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties187;
}

export interface Properties187 {
    id: Id52;
    order_id: OrderId8;
    name: Name16;
    description: Description15;
    amount: Amount5;
    is_tax_inclusive: IsTaxInclusive6;
    shipping_option_id: ShippingOptionId5;
    data: Data9;
    metadata: Metadata44;
    tax_lines: TaxLines4;
    adjustments: Adjustments4;
    original_total: OriginalTotal7;
    original_subtotal: OriginalSubtotal7;
    original_tax_total: OriginalTaxTotal7;
    total: Total7;
    subtotal: Subtotal7;
    tax_total: TaxTotal7;
    discount_total: DiscountTotal7;
    discount_tax_total: DiscountTaxTotal7;
    created_at: CreatedAt30;
    updated_at: UpdatedAt29;
    detail: Detail3;
}

export interface Id52 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId8 {
    type: string;
    title: string;
    description: string;
}

export interface Name16 {
    type: string;
    title: string;
    description: string;
}

export interface Description15 {
    type: string;
    title: string;
    description: string;
}

export interface Amount5 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive6 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId5 {
    type: string;
    title: string;
    description: string;
}

export interface Data9 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs93 {
    url: string;
}

export interface Metadata44 {
    type: string;
    description: string;
}

export interface TaxLines4 {
    type: string;
    description: string;
    items: Items264;
}

export interface Items264 {
    $ref: string;
}

export interface Adjustments4 {
    type: string;
    description: string;
    items: Items265;
}

export interface Items265 {
    $ref: string;
}

export interface OriginalTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal7 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface Total7 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal7 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt30 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt29 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Detail3 {
    $ref: string;
}

export interface AdminPayment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties188;
}

export interface Properties188 {
    id: Id53;
    amount: Amount6;
    authorized_amount: AuthorizedAmount;
    currency_code: CurrencyCode10;
    provider_id: ProviderId6;
    data: Data10;
    created_at: CreatedAt31;
    updated_at: UpdatedAt30;
    captured_at: CapturedAt;
    canceled_at: CanceledAt7;
    captured_amount: CapturedAmount;
    refunded_amount: RefundedAmount;
    captures: Captures;
    refunds: Refunds;
    payment_collection: PaymentCollection;
    payment_session: PaymentSession;
}

export interface Id53 {
    type: string;
    title: string;
    description: string;
}

export interface Amount6 {
    type: string;
    title: string;
    description: string;
}

export interface AuthorizedAmount {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode10 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId6 {
    type: string;
    title: string;
    description: string;
}

export interface Data10 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs94 {
    url: string;
}

export interface CreatedAt31 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt30 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CapturedAt {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CanceledAt7 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CapturedAmount {
    type: string;
    title: string;
    description: string;
}

export interface RefundedAmount {
    type: string;
    title: string;
    description: string;
}

export interface Captures {
    type: string;
    description: string;
    items: Items266;
}

export interface Items266 {
    $ref: string;
}

export interface Refunds {
    type: string;
    description: string;
    items: Items267;
}

export interface Items267 {
    $ref: string;
}

export interface PaymentCollection {
    type: string;
}

export interface PaymentSession {
    $ref: string;
}

export interface AdminPaymentCollection {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties189;
}

export interface Properties189 {
    id: Id54;
    currency_code: CurrencyCode11;
    amount: Amount7;
    authorized_amount: AuthorizedAmount2;
    captured_amount: CapturedAmount2;
    refunded_amount: RefundedAmount2;
    completed_at: CompletedAt;
    created_at: CreatedAt32;
    updated_at: UpdatedAt31;
    metadata: Metadata45;
    status: Status8;
    payment_providers: PaymentProviders3;
    payment_sessions: PaymentSessions;
    payments: Payments;
}

export interface Id54 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode11 {
    type: string;
    title: string;
    description: string;
}

export interface Amount7 {
    type: string;
    title: string;
    description: string;
}

export interface AuthorizedAmount2 {
    type: string;
    title: string;
    description: string;
}

export interface CapturedAmount2 {
    type: string;
    title: string;
    description: string;
}

export interface RefundedAmount2 {
    type: string;
    title: string;
    description: string;
}

export interface CompletedAt {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedAt32 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt31 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata45 {
    type: string;
    description: string;
}

export interface Status8 {
    type: string;
    description: string;
    enum: string[];
}

export interface PaymentProviders3 {
    type: string;
    description: string;
    items: Items268;
}

export interface Items268 {
    $ref: string;
}

export interface PaymentSessions {
    type: string;
    description: string;
    items: Items269;
}

export interface Items269 {
    $ref: string;
}

export interface Payments {
    type: string;
    description: string;
    items: Items270;
}

export interface Items270 {
    $ref: string;
}

export interface AdminPaymentCollectionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties190;
}

export interface Properties190 {
    payment_collection: PaymentCollection2;
}

export interface PaymentCollection2 {
    $ref: string;
}

export interface AdminPaymentProvider {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties191;
}

export interface Properties191 {
    id: Id55;
    is_enabled: IsEnabled2;
}

export interface Id55 {
    type: string;
    title: string;
    description: string;
}

export interface IsEnabled2 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPaymentResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties192;
}

export interface Properties192 {
    payment: Payment;
}

export interface Payment {
    $ref: string;
}

export interface AdminPaymentSession {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties193;
    "required": string[];
}

export interface Properties193 {
    id: Id56;
    amount: Amount8;
    currency_code: CurrencyCode12;
    provider_id: ProviderId7;
    data: Data11;
    context: Context;
    status: Status9;
    authorized_at: AuthorizedAt;
    payment_collection: PaymentCollection3;
    payment: Payment2;
}

export interface Id56 {
    type: string;
    title: string;
    description: string;
}

export interface Amount8 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode12 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ProviderId7 {
    type: string;
    title: string;
    description: string;
}

export interface Data11 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs95 {
    url: string;
}

export interface Context {
    type: string;
    description: string;
    example: Example9;
}

export interface Example9 {
    customer: Customer5;
}

export interface Customer5 {
    id: string;
}

export interface Status9 {
    type: string;
    description: string;
    enum: string[];
}

export interface AuthorizedAt {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface PaymentCollection3 {
    type: string;
}

export interface Payment2 {
    $ref: string;
}

export interface AdminPostCancelClaimReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties194;
}

export interface Properties194 {
    no_notification: NoNotification3;
}

export interface NoNotification3 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostCancelExchangeReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties195;
}

export interface Properties195 {
    no_notification: NoNotification4;
}

export interface NoNotification4 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostCancelReturnReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties196;
}

export interface Properties196 {
    no_notification: NoNotification5;
}

export interface NoNotification5 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostClaimItemsReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties197;
}

export interface Properties197 {
    items: Items271;
}

export interface Items271 {
    type: string;
    description: string;
    items: Items272;
}

export interface Items272 {
    type: string;
    description: string;
    required: string[];
    properties: Properties198;
}

export interface Properties198 {
    id: Id57;
    quantity: Quantity6;
    reason: Reason;
    description: Description16;
    internal_note: InternalNote2;
}

export interface Id57 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity6 {
    type: string;
    title: string;
    description: string;
}

export interface Reason {
    type: string;
    description: string;
    enum: string[];
}

export interface Description16 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote2 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostClaimsAddItemsReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties199;
}

export interface Properties199 {
    items: Items273;
}

export interface Items273 {
    type: string;
    description: string;
    items: Items274;
}

export interface Items274 {
    type: string;
    description: string;
    required: string[];
    properties: Properties200;
}

export interface Properties200 {
    variant_id: VariantId4;
    quantity: Quantity7;
    unit_price: UnitPrice3;
    internal_note: InternalNote3;
    metadata: Metadata46;
}

export interface VariantId4 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity7 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice3 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote3 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata46 {
    type: string;
    description: string;
}

export interface AdminPostClaimsItemsActionReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties201;
}

export interface Properties201 {
    quantity: Quantity8;
    reason_id: ReasonId;
    internal_note: InternalNote4;
}

export interface Quantity8 {
    type: string;
    title: string;
    description: string;
}

export interface ReasonId {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote4 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostClaimsShippingActionReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties202;
}

export interface Properties202 {
    custom_amount: CustomAmount;
    internal_note: InternalNote5;
    metadata: Metadata47;
}

export interface CustomAmount {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote5 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata47 {
    type: string;
    description: string;
}

export interface AdminPostClaimsShippingReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties203;
}

export interface Properties203 {
    shipping_option_id: ShippingOptionId6;
    custom_amount: CustomAmount2;
    description: Description17;
    internal_note: InternalNote6;
    metadata: Metadata48;
}

export interface ShippingOptionId6 {
    type: string;
    title: string;
    description: string;
}

export interface CustomAmount2 {
    type: string;
    title: string;
    description: string;
}

export interface Description17 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote6 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata48 {
    type: string;
    description: string;
}

export interface AdminPostExchangesAddItemsReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties204;
}

export interface Properties204 {
    items: Items275;
}

export interface Items275 {
    type: string;
    description: string;
    items: Items276;
}

export interface Items276 {
    type: string;
    description: string;
    required: string[];
    properties: Properties205;
}

export interface Properties205 {
    variant_id: VariantId5;
    quantity: Quantity9;
    unit_price: UnitPrice4;
    internal_note: InternalNote7;
    allow_backorder: AllowBackorder4;
    metadata: Metadata49;
}

export interface VariantId5 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity9 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice4 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote7 {
    type: string;
    title: string;
    description: string;
}

export interface AllowBackorder4 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata49 {
    type: string;
    description: string;
}

export interface AdminPostExchangesItemsActionReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties206;
}

export interface Properties206 {
    quantity: Quantity10;
    internal_note: InternalNote8;
}

export interface Quantity10 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote8 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostExchangesRequestItemsReturnActionReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties207;
}

export interface Properties207 {
    quantity: Quantity11;
    internal_note: InternalNote9;
    reason_id: ReasonId2;
    metadata: Metadata50;
}

export interface Quantity11 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote9 {
    type: string;
    title: string;
    description: string;
}

export interface ReasonId2 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata50 {
    type: string;
    description: string;
}

export interface AdminPostExchangesReturnRequestItemsReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties208;
}

export interface Properties208 {
    items: Items277;
}

export interface Items277 {
    type: string;
    description: string;
    items: Items278;
}

export interface Items278 {
    type: string;
    description: string;
    required: string[];
    properties: Properties209;
}

export interface Properties209 {
    id: Id58;
    quantity: Quantity12;
    description: Description18;
    internal_note: InternalNote10;
    reason_id: ReasonId3;
    metadata: Metadata51;
}

export interface Id58 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity12 {
    type: string;
    title: string;
    description: string;
}

export interface Description18 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote10 {
    type: string;
    title: string;
    description: string;
}

export interface ReasonId3 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata51 {
    type: string;
    description: string;
}

export interface AdminPostExchangesShippingActionReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties210;
}

export interface Properties210 {
    custom_amount: CustomAmount3;
    internal_note: InternalNote11;
    metadata: Metadata52;
}

export interface CustomAmount3 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote11 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata52 {
    type: string;
    description: string;
}

export interface AdminPostExchangesShippingReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties211;
}

export interface Properties211 {
    shipping_option_id: ShippingOptionId7;
    custom_amount: CustomAmount4;
    description: Description19;
    internal_note: InternalNote12;
    metadata: Metadata53;
}

export interface ShippingOptionId7 {
    type: string;
    title: string;
    description: string;
}

export interface CustomAmount4 {
    type: string;
    title: string;
    description: string;
}

export interface Description19 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote12 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata53 {
    type: string;
    description: string;
}

export interface AdminPostOrderClaimsReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties212;
}

export interface Properties212 {
    type: Type13;
    order_id: OrderId9;
    description: Description20;
    internal_note: InternalNote13;
    reason_id: ReasonId4;
    metadata: Metadata54;
}

export interface Type13 {
    type: string;
    description: string;
    enum: string[];
}

export interface OrderId9 {
    type: string;
    title: string;
    description: string;
}

export interface Description20 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote13 {
    type: string;
    title: string;
    description: string;
}

export interface ReasonId4 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata54 {
    type: string;
    description: string;
}

export interface AdminPostOrderEditsAddItemsReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties213;
}

export interface Properties213 {
    items: Items279;
}

export interface Items279 {
    type: string;
    description: string;
    items: Items280;
}

export interface Items280 {
    type: string;
    description: string;
    required: string[];
    properties: Properties214;
}

export interface Properties214 {
    variant_id: VariantId6;
    quantity: Quantity13;
    unit_price: UnitPrice5;
    internal_note: InternalNote14;
    allow_backorder: AllowBackorder5;
    metadata: Metadata55;
    compare_at_unit_price: CompareAtUnitPrice3;
}

export interface VariantId6 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity13 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice5 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote14 {
    type: string;
    title: string;
    description: string;
}

export interface AllowBackorder5 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata55 {
    type: string;
    description: string;
}

export interface CompareAtUnitPrice3 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostOrderEditsItemsActionReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties215;
}

export interface Properties215 {
    quantity: Quantity14;
    internal_note: InternalNote15;
    unit_price: UnitPrice6;
    compare_at_unit_price: CompareAtUnitPrice4;
}

export interface Quantity14 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote15 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice6 {
    type: string;
    title: string;
    description: string;
}

export interface CompareAtUnitPrice4 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostOrderEditsReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties216;
}

export interface Properties216 {
    order_id: OrderId10;
    description: Description21;
    internal_note: InternalNote16;
    metadata: Metadata56;
}

export interface OrderId10 {
    type: string;
    title: string;
    description: string;
}

export interface Description21 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote16 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata56 {
    type: string;
    description: string;
}

export interface AdminPostOrderEditsShippingActionReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties217;
}

export interface Properties217 {
    custom_amount: CustomAmount5;
    internal_note: InternalNote17;
    metadata: Metadata57;
}

export interface CustomAmount5 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote17 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata57 {
    type: string;
    description: string;
}

export interface AdminPostOrderEditsShippingReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties218;
}

export interface Properties218 {
    shipping_option_id: ShippingOptionId8;
    custom_amount: CustomAmount6;
    description: Description22;
    internal_note: InternalNote18;
    metadata: Metadata58;
}

export interface ShippingOptionId8 {
    type: string;
    title: string;
    description: string;
}

export interface CustomAmount6 {
    type: string;
    title: string;
    description: string;
}

export interface Description22 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote18 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata58 {
    type: string;
    description: string;
}

export interface AdminPostOrderEditsUpdateItemQuantityReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties219;
}

export interface Properties219 {
    quantity: Quantity15;
    internal_note: InternalNote19;
    unit_price: UnitPrice7;
    compare_at_unit_price: CompareAtUnitPrice5;
}

export interface Quantity15 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote19 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice7 {
    type: string;
    title: string;
    description: string;
}

export interface CompareAtUnitPrice5 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostOrderExchangesReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties220;
}

export interface Properties220 {
    order_id: OrderId11;
    description: Description23;
    internal_note: InternalNote20;
    metadata: Metadata59;
}

export interface OrderId11 {
    type: string;
    title: string;
    description: string;
}

export interface Description23 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote20 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata59 {
    type: string;
    description: string;
}

export interface AdminPostReceiveReturnsReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties221;
}

export interface Properties221 {
    internal_note: InternalNote21;
    description: Description24;
    metadata: Metadata60;
}

export interface InternalNote21 {
    type: string;
    title: string;
    description: string;
}

export interface Description24 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata60 {
    type: string;
    description: string;
}

export interface AdminPostReturnsConfirmRequestReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties222;
}

export interface Properties222 {
    no_notification: NoNotification6;
}

export interface NoNotification6 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostReturnsDismissItemsActionReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties223;
}

export interface Properties223 {
    quantity: Quantity16;
    internal_note: InternalNote22;
}

export interface Quantity16 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote22 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostReturnsReceiveItemsActionReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties224;
}

export interface Properties224 {
    quantity: Quantity17;
    internal_note: InternalNote23;
}

export interface Quantity17 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote23 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostReturnsReceiveItemsReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties225;
}

export interface Properties225 {
    items: Items281;
}

export interface Items281 {
    type: string;
    description: string;
    items: Items282;
}

export interface Items282 {
    type: string;
    description: string;
    required: string[];
    properties: Properties226;
}

export interface Properties226 {
    id: Id59;
    quantity: Quantity18;
    description: Description25;
    internal_note: InternalNote24;
}

export interface Id59 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity18 {
    type: string;
    title: string;
    description: string;
}

export interface Description25 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote24 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPostReturnsReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties227;
}

export interface Properties227 {
    order_id: OrderId12;
    location_id: LocationId10;
    description: Description26;
    internal_note: InternalNote25;
    no_notification: NoNotification7;
    metadata: Metadata61;
}

export interface OrderId12 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId10 {
    type: string;
    title: string;
    description: string;
}

export interface Description26 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote25 {
    type: string;
    title: string;
    description: string;
}

export interface NoNotification7 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata61 {
    type: string;
    description: string;
}

export interface AdminPostReturnsRequestItemsActionReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties228;
}

export interface Properties228 {
    quantity: Quantity19;
    internal_note: InternalNote26;
    reason_id: ReasonId5;
    metadata: Metadata62;
}

export interface Quantity19 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote26 {
    type: string;
    title: string;
    description: string;
}

export interface ReasonId5 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata62 {
    type: string;
    description: string;
}

export interface AdminPostReturnsRequestItemsReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties229;
}

export interface Properties229 {
    items: Items283;
}

export interface Items283 {
    type: string;
    description: string;
    items: Items284;
}

export interface Items284 {
    type: string;
    description: string;
    required: string[];
    properties: Properties230;
}

export interface Properties230 {
    id: Id60;
    quantity: Quantity20;
    description: Description27;
    internal_note: InternalNote27;
    reason_id: ReasonId6;
    metadata: Metadata63;
}

export interface Id60 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity20 {
    type: string;
    title: string;
    description: string;
}

export interface Description27 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote27 {
    type: string;
    title: string;
    description: string;
}

export interface ReasonId6 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata63 {
    type: string;
    description: string;
}

export interface AdminPostReturnsReturnReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties231;
}

export interface Properties231 {
    location_id: LocationId11;
    no_notification: NoNotification8;
    metadata: Metadata64;
}

export interface LocationId11 {
    type: string;
    title: string;
    description: string;
}

export interface NoNotification8 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata64 {
    type: string;
    description: string;
}

export interface AdminPostReturnsShippingActionReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties232;
}

export interface Properties232 {
    custom_amount: CustomAmount7;
    internal_note: InternalNote28;
    metadata: Metadata65;
}

export interface CustomAmount7 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote28 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata65 {
    type: string;
    description: string;
}

export interface AdminPostReturnsShippingReqSchema {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties233;
}

export interface Properties233 {
    shipping_option_id: ShippingOptionId9;
    custom_amount: CustomAmount8;
    description: Description28;
    internal_note: InternalNote29;
    metadata: Metadata66;
}

export interface ShippingOptionId9 {
    type: string;
    title: string;
    description: string;
}

export interface CustomAmount8 {
    type: string;
    title: string;
    description: string;
}

export interface Description28 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote29 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata66 {
    type: string;
    description: string;
}

export interface AdminPrice {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties234;
}

export interface Properties234 {
    id: Id61;
    title: Title17;
    currency_code: CurrencyCode13;
    amount: Amount9;
    raw_amount: RawAmount;
    min_quantity: MinQuantity3;
    max_quantity: MaxQuantity4;
    price_set_id: PriceSetId;
    created_at: CreatedAt33;
    updated_at: UpdatedAt32;
    deleted_at: DeletedAt16;
}

export interface Id61 {
    type: string;
    title: string;
    description: string;
}

export interface Title17 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode13 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Amount9 {
    type: string;
    title: string;
    description: string;
}

export interface RawAmount {
    type: string;
    description: string;
}

export interface MinQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface MaxQuantity4 {
    type: string;
    title: string;
    description: string;
}

export interface PriceSetId {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt33 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt32 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt16 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminPriceList {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties235;
}

export interface Properties235 {
    id: Id62;
    title: Title18;
    description: Description29;
    rules: Rules6;
    starts_at: StartsAt3;
    ends_at: EndsAt3;
    status: Status10;
    type: Type14;
    prices: Prices5;
    created_at: CreatedAt34;
    updated_at: UpdatedAt33;
    deleted_at: DeletedAt17;
}

export interface Id62 {
    type: string;
    title: string;
    description: string;
}

export interface Title18 {
    type: string;
    title: string;
    description: string;
}

export interface Description29 {
    type: string;
    title: string;
    description: string;
}

export interface Rules6 {
    type: string;
    description: string;
}

export interface StartsAt3 {
    type: string;
    title: string;
    description: string;
}

export interface EndsAt3 {
    type: string;
    title: string;
    description: string;
}

export interface Status10 {
    type: string;
    description: string;
    enum: string[];
}

export interface Type14 {
    type: string;
    description: string;
    enum: string[];
}

export interface Prices5 {
    type: string;
    description: string;
    items: Items285;
}

export interface Items285 {
    $ref: string;
}

export interface CreatedAt34 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt33 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt17 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminPriceListBatchResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties236;
}

export interface Properties236 {
    created: Created4;
    updated: Updated4;
    deleted: Deleted13;
}

export interface Created4 {
    type: string;
    description: string;
    items: Items286;
}

export interface Items286 {
    $ref: string;
}

export interface Updated4 {
    type: string;
    description: string;
    items: Items287;
}

export interface Items287 {
    $ref: string;
}

export interface Deleted13 {
    type: string;
    description: string;
    required: string[];
    properties: Properties237;
}

export interface Properties237 {
    ids: Ids3;
    object: Object10;
    deleted: Deleted14;
}

export interface Ids3 {
    type: string;
    description: string;
    items: Items288;
}

export interface Items288 {
    type: string;
    title: string;
    description: string;
}

export interface Object10 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted14 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPriceListDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties238;
}

export interface Properties238 {
    id: Id63;
    object: Object11;
    deleted: Deleted15;
}

export interface Id63 {
    type: string;
    title: string;
    description: string;
}

export interface Object11 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted15 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPriceListListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties239;
}

export interface Properties239 {
    limit: Limit15;
    offset: Offset14;
    count: Count14;
    price_lists: PriceLists;
}

export interface Limit15 {
    type: string;
    title: string;
    description: string;
}

export interface Offset14 {
    type: string;
    title: string;
    description: string;
}

export interface Count14 {
    type: string;
    title: string;
    description: string;
}

export interface PriceLists {
    type: string;
    description: string;
    items: Items289;
}

export interface Items289 {
    $ref: string;
}

export interface AdminPriceListPrice {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties240;
}

export interface Properties240 {
    variant_id: VariantId7;
    rules: Rules7;
    id: Id64;
    title: Title19;
    currency_code: CurrencyCode14;
    amount: Amount10;
    raw_amount: RawAmount2;
    min_quantity: MinQuantity4;
    max_quantity: MaxQuantity5;
    price_set_id: PriceSetId2;
    created_at: CreatedAt35;
    updated_at: UpdatedAt34;
    deleted_at: DeletedAt18;
}

export interface VariantId7 {
    type: string;
    title: string;
    description: string;
}

export interface Rules7 {
    type: string;
    description: string;
}

export interface Id64 {
    type: string;
    title: string;
    description: string;
}

export interface Title19 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode14 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Amount10 {
    type: string;
    title: string;
    description: string;
}

export interface RawAmount2 {
    type: string;
    description: string;
}

export interface MinQuantity4 {
    type: string;
    title: string;
    description: string;
}

export interface MaxQuantity5 {
    type: string;
    title: string;
    description: string;
}

export interface PriceSetId2 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt35 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt34 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt18 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminPriceListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties241;
}

export interface Properties241 {
    price_list: PriceList;
}

export interface PriceList {
    $ref: string;
}

export interface AdminPricePreference {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties242;
}

export interface Properties242 {
    id: Id65;
    attribute: Attribute4;
    value: Value8;
    is_tax_inclusive: IsTaxInclusive7;
    created_at: CreatedAt36;
    updated_at: UpdatedAt35;
    deleted_at: DeletedAt19;
}

export interface Id65 {
    type: string;
    title: string;
    description: string;
}

export interface Attribute4 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Value8 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface IsTaxInclusive7 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt36 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt35 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt19 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminPricePreferenceDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties243;
}

export interface Properties243 {
    id: Id66;
    object: Object12;
    deleted: Deleted16;
}

export interface Id66 {
    type: string;
    title: string;
    description: string;
}

export interface Object12 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted16 {
    type: string;
    title: string;
    description: string;
}

export interface AdminPricePreferenceListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties244;
}

export interface Properties244 {
    limit: Limit16;
    offset: Offset15;
    count: Count15;
    price_preferences: PricePreferences;
}

export interface Limit16 {
    type: string;
    title: string;
    description: string;
}

export interface Offset15 {
    type: string;
    title: string;
    description: string;
}

export interface Count15 {
    type: string;
    title: string;
    description: string;
}

export interface PricePreferences {
    type: string;
    description: string;
    items: Items290;
}

export interface Items290 {
    $ref: string;
}

export interface AdminPricePreferenceResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties245;
}

export interface Properties245 {
    price_preference: PricePreference;
}

export interface PricePreference {
    $ref: string;
}

export interface AdminProduct {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties246;
}

export interface Properties246 {
    collection: Collection2;
    categories: Categories3;
    sales_channels: SalesChannels3;
    variants: Variants3;
    type: Type15;
    tags: Tags3;
    length: Length7;
    title: Title20;
    status: Status11;
    options: Options6;
    description: Description30;
    id: Id67;
    metadata: Metadata67;
    created_at: CreatedAt37;
    updated_at: UpdatedAt36;
    handle: Handle6;
    subtitle: Subtitle5;
    is_giftcard: IsGiftcard3;
    thumbnail: Thumbnail7;
    width: Width7;
    weight: Weight7;
    height: Height7;
    origin_country: OriginCountry7;
    hs_code: HsCode7;
    mid_code: MidCode7;
    material: Material7;
    collection_id: CollectionId3;
    type_id: TypeId3;
    images: Images3;
    discountable: Discountable3;
    external_id: ExternalId4;
    deleted_at: DeletedAt20;
    shipping_profile: ShippingProfile;
}

export interface Collection2 {
    $ref: string;
}

export interface Categories3 {
    type: string;
    description: string;
    items: Items291;
}

export interface Items291 {
    $ref: string;
}

export interface SalesChannels3 {
    type: string;
    description: string;
    items: Items292;
}

export interface Items292 {
    $ref: string;
}

export interface Variants3 {
    type: string;
    description: string;
    items: Items293;
}

export interface Items293 {
    $ref: string;
}

export interface Type15 {
    $ref: string;
}

export interface Tags3 {
    type: string;
    description: string;
    items: Items294;
}

export interface Items294 {
    $ref: string;
}

export interface Length7 {
    type: string;
    title: string;
    description: string;
}

export interface Title20 {
    type: string;
    title: string;
    description: string;
}

export interface Status11 {
    type: string;
    description: string;
    enum: string[];
}

export interface Options6 {
    type: string;
    description: string;
    items: Items295;
}

export interface Items295 {
    $ref: string;
}

export interface Description30 {
    type: string;
    title: string;
    description: string;
}

export interface Id67 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata67 {
    type: string;
    description: string;
}

export interface CreatedAt37 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt36 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Handle6 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle5 {
    type: string;
    title: string;
    description: string;
}

export interface IsGiftcard3 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail7 {
    type: string;
    title: string;
    description: string;
}

export interface Width7 {
    type: string;
    title: string;
    description: string;
}

export interface Weight7 {
    type: string;
    title: string;
    description: string;
}

export interface Height7 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry7 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode7 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode7 {
    type: string;
    title: string;
    description: string;
}

export interface Material7 {
    type: string;
    title: string;
    description: string;
}

export interface CollectionId3 {
    type: string;
    title: string;
    description: string;
}

export interface TypeId3 {
    type: string;
    title: string;
    description: string;
}

export interface Images3 {
    type: string;
    description: string;
    items: Items296;
}

export interface Items296 {
    $ref: string;
}

export interface Discountable3 {
    type: string;
    title: string;
    description: string;
}

export interface ExternalId4 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt20 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface ShippingProfile {
    $ref: string;
}

export interface AdminProductCategory {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties247;
}

export interface Properties247 {
    category_children: CategoryChildren;
    parent_category: ParentCategory;
    products: Products3;
    name: Name17;
    description: Description31;
    id: Id68;
    metadata: Metadata68;
    created_at: CreatedAt38;
    updated_at: UpdatedAt37;
    handle: Handle7;
    deleted_at: DeletedAt21;
    is_active: IsActive2;
    is_internal: IsInternal2;
    rank: Rank2;
    parent_category_id: ParentCategoryId2;
}

export interface CategoryChildren {
    type: string;
    description: string;
    items: Items297;
}

export interface Items297 {
    type: string;
}

export interface ParentCategory {
    type: string;
}

export interface Products3 {
    type: string;
    description: string;
    items: Items298;
}

export interface Items298 {
    type: string;
}

export interface Name17 {
    type: string;
    title: string;
    description: string;
}

export interface Description31 {
    type: string;
    title: string;
    description: string;
}

export interface Id68 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata68 {
    type: string;
    description: string;
}

export interface CreatedAt38 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt37 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Handle7 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt21 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface IsActive2 {
    type: string;
    title: string;
    description: string;
}

export interface IsInternal2 {
    type: string;
    title: string;
    description: string;
}

export interface Rank2 {
    type: string;
    title: string;
    description: string;
}

export interface ParentCategoryId2 {
    type: string;
    title: string;
    description: string;
}

export interface AdminProductCategoryDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties248;
}

export interface Properties248 {
    id: Id69;
    object: Object13;
    deleted: Deleted17;
}

export interface Id69 {
    type: string;
    title: string;
    description: string;
}

export interface Object13 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted17 {
    type: string;
    title: string;
    description: string;
}

export interface AdminProductCategoryListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties249;
}

export interface Properties249 {
    limit: Limit17;
    offset: Offset16;
    count: Count16;
    product_categories: ProductCategories;
}

export interface Limit17 {
    type: string;
    title: string;
    description: string;
}

export interface Offset16 {
    type: string;
    title: string;
    description: string;
}

export interface Count16 {
    type: string;
    title: string;
    description: string;
}

export interface ProductCategories {
    type: string;
    description: string;
    items: Items299;
}

export interface Items299 {
    $ref: string;
}

export interface AdminProductCategoryResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties250;
}

export interface Properties250 {
    product_category: ProductCategory;
}

export interface ProductCategory {
    $ref: string;
}

export interface AdminProductDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties251;
}

export interface Properties251 {
    id: Id70;
    object: Object14;
    deleted: Deleted18;
}

export interface Id70 {
    type: string;
    title: string;
    description: string;
}

export interface Object14 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted18 {
    type: string;
    title: string;
    description: string;
}

export interface AdminProductImage {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties252;
    "required": string[];
}

export interface Properties252 {
    id: Id71;
    url: Url4;
    created_at: CreatedAt39;
    updated_at: UpdatedAt38;
    deleted_at: DeletedAt22;
    metadata: Metadata69;
    rank: Rank3;
}

export interface Id71 {
    type: string;
    title: string;
    description: string;
}

export interface Url4 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt39 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt38 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt22 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata69 {
    type: string;
    description: string;
}

export interface Rank3 {
    type: string;
    title: string;
    description: string;
}

export interface AdminProductOption {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties253;
}

export interface Properties253 {
    id: Id72;
    title: Title21;
    product: Product3;
    product_id: ProductId3;
    values: Values3;
    metadata: Metadata70;
    created_at: CreatedAt40;
    updated_at: UpdatedAt39;
    deleted_at: DeletedAt23;
}

export interface Id72 {
    type: string;
    title: string;
    description: string;
}

export interface Title21 {
    type: string;
    title: string;
    description: string;
}

export interface Product3 {
    type: string;
}

export interface ProductId3 {
    type: string;
    title: string;
    description: string;
}

export interface Values3 {
    type: string;
    description: string;
    items: Items300;
}

export interface Items300 {
    type: string;
}

export interface Metadata70 {
    type: string;
    description: string;
}

export interface CreatedAt40 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt39 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt23 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminProductOptionDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties254;
}

export interface Properties254 {
    id: Id73;
    object: Object15;
    deleted: Deleted19;
    parent: Parent3;
}

export interface Id73 {
    type: string;
    title: string;
    description: string;
}

export interface Object15 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted19 {
    type: string;
    title: string;
    description: string;
}

export interface Parent3 {
    $ref: string;
}

export interface AdminProductOptionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties255;
}

export interface Properties255 {
    product_option: ProductOption;
}

export interface ProductOption {
    $ref: string;
}

export interface AdminProductOptionValue {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties256;
}

export interface Properties256 {
    id: Id74;
    value: Value9;
    option: Option;
    option_id: OptionId3;
    metadata: Metadata71;
    created_at: CreatedAt41;
    updated_at: UpdatedAt40;
    deleted_at: DeletedAt24;
}

export interface Id74 {
    type: string;
    title: string;
    description: string;
}

export interface Value9 {
    type: string;
    title: string;
    description: string;
}

export interface Option {
    $ref: string;
}

export interface OptionId3 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata71 {
    type: string;
    description: string;
}

export interface CreatedAt41 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt40 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt24 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminProductResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties257;
}

export interface Properties257 {
    product: Product4;
}

export interface Product4 {
    $ref: string;
}

export interface AdminProductTag {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties258;
}

export interface Properties258 {
    id: Id75;
    value: Value10;
    created_at: CreatedAt42;
    updated_at: UpdatedAt41;
    deleted_at: DeletedAt25;
    metadata: Metadata72;
}

export interface Id75 {
    type: string;
    title: string;
    description: string;
}

export interface Value10 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt42 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt41 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt25 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata72 {
    type: string;
    description: string;
}

export interface AdminProductTagDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties259;
}

export interface Properties259 {
    id: Id76;
    object: Object16;
    deleted: Deleted20;
}

export interface Id76 {
    type: string;
    title: string;
    description: string;
}

export interface Object16 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted20 {
    type: string;
    title: string;
    description: string;
}

export interface AdminProductTagListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties260;
}

export interface Properties260 {
    limit: Limit18;
    offset: Offset17;
    count: Count17;
    product_tags: ProductTags;
}

export interface Limit18 {
    type: string;
    title: string;
    description: string;
}

export interface Offset17 {
    type: string;
    title: string;
    description: string;
}

export interface Count17 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTags {
    type: string;
    description: string;
    items: Items301;
}

export interface Items301 {
    $ref: string;
}

export interface AdminProductTagResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties261;
}

export interface Properties261 {
    product_tag: ProductTag;
}

export interface ProductTag {
    $ref: string;
}

export interface AdminProductType {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties262;
}

export interface Properties262 {
    id: Id77;
    value: Value11;
    created_at: CreatedAt43;
    updated_at: UpdatedAt42;
    deleted_at: DeletedAt26;
    metadata: Metadata73;
}

export interface Id77 {
    type: string;
    title: string;
    description: string;
}

export interface Value11 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt43 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt42 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt26 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata73 {
    type: string;
    description: string;
}

export interface AdminProductTypeDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties263;
}

export interface Properties263 {
    id: Id78;
    object: Object17;
    deleted: Deleted21;
}

export interface Id78 {
    type: string;
    title: string;
    description: string;
}

export interface Object17 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted21 {
    type: string;
    title: string;
    description: string;
}

export interface AdminProductTypeListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties264;
}

export interface Properties264 {
    limit: Limit19;
    offset: Offset18;
    count: Count18;
    product_types: ProductTypes;
}

export interface Limit19 {
    type: string;
    title: string;
    description: string;
}

export interface Offset18 {
    type: string;
    title: string;
    description: string;
}

export interface Count18 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTypes {
    type: string;
    description: string;
    items: Items302;
}

export interface Items302 {
    $ref: string;
}

export interface AdminProductTypeResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties265;
}

export interface Properties265 {
    product_type: ProductType3;
}

export interface ProductType3 {
    $ref: string;
}

export interface AdminProductVariant {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties266;
}

export interface Properties266 {
    prices: Prices6;
    id: Id79;
    title: Title22;
    sku: Sku7;
    barcode: Barcode5;
    ean: Ean3;
    upc: Upc3;
    allow_backorder: AllowBackorder6;
    manage_inventory: ManageInventory3;
    inventory_quantity: InventoryQuantity;
    hs_code: HsCode8;
    origin_country: OriginCountry8;
    mid_code: MidCode8;
    material: Material8;
    weight: Weight8;
    length: Length8;
    height: Height8;
    width: Width8;
    variant_rank: VariantRank3;
    options: Options7;
    product: Product5;
    product_id: ProductId4;
    calculated_price: CalculatedPrice;
    created_at: CreatedAt44;
    updated_at: UpdatedAt43;
    deleted_at: DeletedAt27;
    metadata: Metadata74;
    inventory_items: InventoryItems2;
}

export interface Prices6 {
    type: string;
    description: string;
    items: Items303;
}

export interface Items303 {
    $ref: string;
}

export interface Id79 {
    type: string;
    title: string;
    description: string;
}

export interface Title22 {
    type: string;
    title: string;
    description: string;
}

export interface Sku7 {
    type: string;
    title: string;
    description: string;
}

export interface Barcode5 {
    type: string;
    title: string;
    description: string;
}

export interface Ean3 {
    type: string;
    title: string;
    description: string;
}

export interface Upc3 {
    type: string;
    title: string;
    description: string;
}

export interface AllowBackorder6 {
    type: string;
    title: string;
    description: string;
}

export interface ManageInventory3 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryQuantity {
    type: string;
    title: string;
    description: string;
}

export interface HsCode8 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry8 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode8 {
    type: string;
    title: string;
    description: string;
}

export interface Material8 {
    type: string;
    title: string;
    description: string;
}

export interface Weight8 {
    type: string;
    title: string;
    description: string;
}

export interface Length8 {
    type: string;
    title: string;
    description: string;
}

export interface Height8 {
    type: string;
    title: string;
    description: string;
}

export interface Width8 {
    type: string;
    title: string;
    description: string;
}

export interface VariantRank3 {
    type: string;
    title: string;
    description: string;
}

export interface Options7 {
    type: string;
    description: string;
    items: Items304;
}

export interface Items304 {
    $ref: string;
}

export interface Product5 {
    type: string;
}

export interface ProductId4 {
    type: string;
    title: string;
    description: string;
}

export interface CalculatedPrice {
    $ref: string;
}

export interface CreatedAt44 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt43 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt27 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata74 {
    type: string;
    description: string;
}

export interface InventoryItems2 {
    type: string;
    description: string;
    items: Items305;
}

export interface Items305 {
    $ref: string;
}

export interface AdminProductVariantDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties267;
}

export interface Properties267 {
    id: Id80;
    object: Object18;
    deleted: Deleted22;
    parent: Parent4;
}

export interface Id80 {
    type: string;
    title: string;
    description: string;
}

export interface Object18 {
    type: string;
    title: string;
    description: string;
}

export interface Deleted22 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Parent4 {
    $ref: string;
}

export interface AdminProductVariantInventoryBatchResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties268;
}

export interface Properties268 {
    created: Created5;
    updated: Updated5;
    deleted: Deleted23;
}

export interface Created5 {
    oneOf: OneOf60[];
}

export interface OneOf60 {
    $ref?: string;
    type?: string;
    description?: string;
    items?: Items306;
}

export interface Items306 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties269;
}

export interface Properties269 {
    productService: ProductService;
    inventoryService: InventoryService;
}

export interface ProductService {
    type: string;
    description: string;
    required: string[];
    properties: Properties270;
}

export interface Properties270 {
    variant_id: VariantId8;
}

export interface VariantId8 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryService {
    type: string;
    description: string;
    required: string[];
    properties: Properties271;
}

export interface Properties271 {
    inventory_item_id: InventoryItemId9;
}

export interface InventoryItemId9 {
    type: string;
    title: string;
    description: string;
}

export interface Updated5 {
    oneOf: OneOf61[];
}

export interface OneOf61 {
    $ref?: string;
    type?: string;
    description?: string;
    items?: Items307;
}

export interface Items307 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties272;
}

export interface Properties272 {
    productService: ProductService2;
    inventoryService: InventoryService2;
}

export interface ProductService2 {
    type: string;
    description: string;
    required: string[];
    properties: Properties273;
}

export interface Properties273 {
    variant_id: VariantId9;
}

export interface VariantId9 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryService2 {
    type: string;
    description: string;
    required: string[];
    properties: Properties274;
}

export interface Properties274 {
    inventory_item_id: InventoryItemId10;
}

export interface InventoryItemId10 {
    type: string;
    title: string;
    description: string;
}

export interface Deleted23 {
    oneOf: OneOf62[];
}

export interface OneOf62 {
    $ref?: string;
    type?: string;
    description?: string;
    items?: Items308;
}

export interface Items308 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties275;
}

export interface Properties275 {
    productService: ProductService3;
    inventoryService: InventoryService3;
}

export interface ProductService3 {
    type: string;
    description: string;
    required: string[];
    properties: Properties276;
}

export interface Properties276 {
    variant_id: VariantId10;
}

export interface VariantId10 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryService3 {
    type: string;
    description: string;
    required: string[];
    properties: Properties277;
}

export interface Properties277 {
    inventory_item_id: InventoryItemId11;
}

export interface InventoryItemId11 {
    type: string;
    title: string;
    description: string;
}

export interface AdminProductVariantInventoryItemLink {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties278;
}

export interface Properties278 {
    id: Id81;
    variant_id: VariantId11;
    variant: Variant3;
    inventory_item_id: InventoryItemId12;
    inventory: Inventory;
}

export interface Id81 {
    type: string;
    title: string;
    description: string;
}

export interface VariantId11 {
    type: string;
    title: string;
    description: string;
}

export interface Variant3 {
    type: string;
}

export interface InventoryItemId12 {
    type: string;
    title: string;
    description: string;
}

export interface Inventory {
    $ref: string;
}

export interface AdminProductVariantInventoryLink {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties279;
}

export interface Properties279 {
    Product: Product6;
    Inventory: Inventory2;
}

export interface Product6 {
    type: string;
    description: string;
    required: string[];
    properties: Properties280;
}

export interface Properties280 {
    variant_id: VariantId12;
}

export interface VariantId12 {
    type: string;
    title: string;
    description: string;
}

export interface Inventory2 {
    type: string;
    description: string;
    required: string[];
    properties: Properties281;
}

export interface Properties281 {
    inventory_item_id: InventoryItemId13;
}

export interface InventoryItemId13 {
    type: string;
    title: string;
    description: string;
}

export interface AdminProductVariantInventoryLinkDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties282;
}

export interface Properties282 {
    id: Id82;
    object: Object19;
    deleted: Deleted24;
    parent: Parent5;
}

export interface Id82 {
    $ref: string;
}

export interface Object19 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted24 {
    type: string;
    title: string;
    description: string;
}

export interface Parent5 {
    $ref: string;
}

export interface AdminProductVariantResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties283;
}

export interface Properties283 {
    variant: Variant4;
}

export interface Variant4 {
    $ref: string;
}

export interface AdminPromotion {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties284;
}

export interface Properties284 {
    application_method: ApplicationMethod;
    rules: Rules8;
    id: Id83;
    code: Code5;
    type: Type16;
    is_automatic: IsAutomatic;
    campaign_id: CampaignId;
    campaign: Campaign2;
    created_at: CreatedAt45;
    updated_at: UpdatedAt44;
    deleted_at: DeletedAt28;
    status: Status12;
}

export interface ApplicationMethod {
    $ref: string;
}

export interface Rules8 {
    type: string;
    description: string;
    items: Items309;
}

export interface Items309 {
    $ref: string;
}

export interface Id83 {
    type: string;
    title: string;
    description: string;
}

export interface Code5 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Type16 {
    type: string;
    description: string;
    enum: string[];
}

export interface IsAutomatic {
    type: string;
    title: string;
    description: string;
}

export interface CampaignId {
    type: string;
    title: string;
    description: string;
}

export interface Campaign2 {
    $ref: string;
}

export interface CreatedAt45 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt44 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt28 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Status12 {
    type: string;
    description: string;
    enum: string[];
}

export interface AdminPromotionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties285;
}

export interface Properties285 {
    promotion: Promotion2;
}

export interface Promotion2 {
    $ref: string;
}

export interface AdminPromotionRule {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties286;
}

export interface Properties286 {
    id: Id84;
    description: Description32;
    attribute: Attribute5;
    operator: Operator3;
    values: Values4;
}

export interface Id84 {
    type: string;
    title: string;
    description: string;
}

export interface Description32 {
    type: string;
    title: string;
    description: string;
}

export interface Attribute5 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Operator3 {
    type: string;
    description: string;
    enum: string[];
}

export interface Values4 {
    type: string;
    description: string;
    example: string[];
    items: Items310;
}

export interface Items310 {
    $ref: string;
}

export interface AdminRefund {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties287;
}

export interface Properties287 {
    id: Id85;
    amount: Amount11;
    refund_reason_id: RefundReasonId;
    note: Note;
    created_at: CreatedAt46;
    created_by: CreatedBy6;
    payment: Payment3;
    refund_reason: RefundReason;
}

export interface Id85 {
    type: string;
    title: string;
    description: string;
}

export interface Amount11 {
    type: string;
    title: string;
    description: string;
}

export interface RefundReasonId {
    type: string;
    title: string;
    description: string;
}

export interface Note {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt46 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedBy6 {
    type: string;
    title: string;
    description: string;
}

export interface Payment3 {
    $ref: string;
}

export interface RefundReason {
    $ref: string;
}

export interface AdminRefundReason {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties288;
}

export interface Properties288 {
    id: Id86;
    label: Label4;
    description: Description33;
    metadata: Metadata75;
    created_at: CreatedAt47;
    updated_at: UpdatedAt45;
}

export interface Id86 {
    type: string;
    title: string;
    description: string;
}

export interface Label4 {
    type: string;
    title: string;
    description: string;
}

export interface Description33 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata75 {
    type: string;
    description: string;
}

export interface CreatedAt47 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt45 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminRegion {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties289;
}

export interface Properties289 {
    id: Id87;
    name: Name18;
    currency_code: CurrencyCode15;
    automatic_taxes: AutomaticTaxes2;
    countries: Countries2;
    payment_providers: PaymentProviders4;
    metadata: Metadata76;
    created_at: CreatedAt48;
    updated_at: UpdatedAt46;
}

export interface Id87 {
    type: string;
    title: string;
    description: string;
}

export interface Name18 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode15 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface AutomaticTaxes2 {
    type: string;
    title: string;
    description: string;
}

export interface Countries2 {
    type: string;
    description: string;
    items: Items311;
}

export interface Items311 {
    $ref: string;
}

export interface PaymentProviders4 {
    type: string;
    description: string;
    items: Items312;
}

export interface Items312 {
    $ref: string;
}

export interface Metadata76 {
    type: string;
    description: string;
}

export interface CreatedAt48 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt46 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminRegionCountry {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties290;
}

export interface Properties290 {
    id: Id88;
    iso_2: Iso2;
    iso_3: Iso3;
    num_code: NumCode;
    name: Name19;
    display_name: DisplayName;
}

export interface Id88 {
    type: string;
    title: string;
    description: string;
}

export interface Iso2 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Iso3 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface NumCode {
    type: string;
    title: string;
    description: string;
    example: number;
}

export interface Name19 {
    type: string;
    title: string;
    description: string;
}

export interface DisplayName {
    type: string;
    title: string;
    description: string;
}

export interface AdminRegionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties291;
}

export interface Properties291 {
    region: Region2;
}

export interface Region2 {
    $ref: string;
}

export interface AdminReservation {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties292;
}

export interface Properties292 {
    id: Id89;
    line_item_id: LineItemId4;
    location_id: LocationId12;
    quantity: Quantity21;
    external_id: ExternalId5;
    description: Description34;
    inventory_item_id: InventoryItemId14;
    inventory_item: InventoryItem3;
    metadata: Metadata77;
    created_by: CreatedBy7;
    deleted_at: DeletedAt29;
    created_at: CreatedAt49;
    updated_at: UpdatedAt47;
}

export interface Id89 {
    type: string;
    title: string;
    description: string;
}

export interface LineItemId4 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId12 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity21 {
    type: string;
    title: string;
    description: string;
}

export interface ExternalId5 {
    type: string;
    title: string;
    description: string;
}

export interface Description34 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryItemId14 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryItem3 {
    $ref: string;
}

export interface Metadata77 {
    type: string;
    description: string;
}

export interface CreatedBy7 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt29 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedAt49 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt47 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminReservationResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties293;
}

export interface Properties293 {
    reservation: Reservation;
}

export interface Reservation {
    $ref: string;
}

export interface AdminReturn {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties294;
}

export interface Properties294 {
    id: Id90;
    status: Status13;
    refund_amount: RefundAmount2;
    order_id: OrderId13;
    items: Items313;
    created_at: CreatedAt50;
    canceled_at: CanceledAt8;
    exchange_id: ExchangeId3;
    location_id: LocationId13;
    claim_id: ClaimId3;
    order_version: OrderVersion3;
    display_id: DisplayId6;
    no_notification: NoNotification9;
    received_at: ReceivedAt;
}

export interface Id90 {
    type: string;
    title: string;
    description: string;
}

export interface Status13 {
    type: string;
    description: string;
    enum: string[];
}

export interface RefundAmount2 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId13 {
    type: string;
    title: string;
    description: string;
}

export interface Items313 {
    type: string;
    description: string;
    items: Items314;
}

export interface Items314 {
    $ref: string;
}

export interface CreatedAt50 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CanceledAt8 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface ExchangeId3 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId13 {
    type: string;
    title: string;
    description: string;
}

export interface ClaimId3 {
    type: string;
    title: string;
    description: string;
}

export interface OrderVersion3 {
    type: string;
    title: string;
    description: string;
}

export interface DisplayId6 {
    type: string;
    title: string;
    description: string;
}

export interface NoNotification9 {
    type: string;
    title: string;
    description: string;
}

export interface ReceivedAt {
    type: string;
    title: string;
    description: string;
}

export interface AdminReturnItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties295;
}

export interface Properties295 {
    id: Id91;
    quantity: Quantity22;
    received_quantity: ReceivedQuantity;
    damaged_quantity: DamagedQuantity;
    reason_id: ReasonId7;
    note: Note2;
    item_id: ItemId2;
    return_id: ReturnId5;
    metadata: Metadata78;
}

export interface Id91 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity22 {
    type: string;
    title: string;
    description: string;
}

export interface ReceivedQuantity {
    type: string;
    title: string;
    description: string;
}

export interface DamagedQuantity {
    type: string;
    title: string;
    description: string;
}

export interface ReasonId7 {
    type: string;
    title: string;
    description: string;
}

export interface Note2 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId2 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId5 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata78 {
    type: string;
    description: string;
}

export interface AdminReturnPreviewResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties296;
}

export interface Properties296 {
    order_preview: OrderPreview8;
    return: Return8;
}

export interface OrderPreview8 {
    $ref: string;
}

export interface Return8 {
    $ref: string;
}

export interface AdminReturnReason {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties297;
}

export interface Properties297 {
    id: Id92;
    value: Value12;
    label: Label5;
    description: Description35;
    metadata: Metadata79;
    created_at: CreatedAt51;
    updated_at: UpdatedAt48;
}

export interface Id92 {
    type: string;
    title: string;
    description: string;
}

export interface Value12 {
    type: string;
    title: string;
    description: string;
}

export interface Label5 {
    type: string;
    title: string;
    description: string;
}

export interface Description35 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata79 {
    type: string;
    description: string;
}

export interface CreatedAt51 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt48 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminReturnReasonDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties298;
}

export interface Properties298 {
    id: Id93;
    object: Object20;
    deleted: Deleted25;
}

export interface Id93 {
    type: string;
    title: string;
    description: string;
}

export interface Object20 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted25 {
    type: string;
    title: string;
    description: string;
}

export interface AdminReturnReasonListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties299;
}

export interface Properties299 {
    limit: Limit20;
    offset: Offset19;
    count: Count19;
    return_reasons: ReturnReasons2;
}

export interface Limit20 {
    type: string;
    title: string;
    description: string;
}

export interface Offset19 {
    type: string;
    title: string;
    description: string;
}

export interface Count19 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnReasons2 {
    type: string;
    description: string;
    items: Items315;
}

export interface Items315 {
    $ref: string;
}

export interface AdminReturnReasonResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties300;
}

export interface Properties300 {
    return_reason: ReturnReason;
}

export interface ReturnReason {
    $ref: string;
}

export interface AdminReturnResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties301;
}

export interface Properties301 {
    return: Return9;
}

export interface Return9 {
    $ref: string;
}

export interface AdminRevokeApiKey {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties302;
}

export interface Properties302 {
    revoke_in: RevokeIn;
}

export interface RevokeIn {
    type: string;
    title: string;
    description: string;
}

export interface AdminRuleAttributeOption {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties303;
}

export interface Properties303 {
    id: Id94;
    value: Value13;
    label: Label6;
    operators: Operators;
}

export interface Id94 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Value13 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Label6 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Operators {
    type: string;
    description: string;
    items: Items316;
}

export interface Items316 {
    $ref: string;
}

export interface AdminRuleValueOption {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties304;
}

export interface Properties304 {
    value: Value14;
    label: Label7;
}

export interface Value14 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Label7 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface AdminSalesChannel {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties305;
}

export interface Properties305 {
    id: Id95;
    name: Name20;
    description: Description36;
    is_disabled: IsDisabled2;
    metadata: Metadata80;
    created_at: CreatedAt52;
    updated_at: UpdatedAt49;
    deleted_at: DeletedAt30;
}

export interface Id95 {
    type: string;
    title: string;
    description: string;
}

export interface Name20 {
    type: string;
    title: string;
    description: string;
}

export interface Description36 {
    type: string;
    title: string;
    description: string;
}

export interface IsDisabled2 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata80 {
    type: string;
    description: string;
}

export interface CreatedAt52 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt49 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt30 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminSalesChannelDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties306;
}

export interface Properties306 {
    id: Id96;
    object: Object21;
    deleted: Deleted26;
}

export interface Id96 {
    type: string;
    title: string;
    description: string;
}

export interface Object21 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted26 {
    type: string;
    title: string;
    description: string;
}

export interface AdminSalesChannelResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties307;
}

export interface Properties307 {
    sales_channel: SalesChannel4;
}

export interface SalesChannel4 {
    $ref: string;
}

export interface AdminServiceZone {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties308;
}

export interface Properties308 {
    id: Id97;
    name: Name21;
    fulfillment_set_id: FulfillmentSetId;
    fulfillment_set: FulfillmentSet2;
    geo_zones: GeoZones;
    shipping_options: ShippingOptions;
    created_at: CreatedAt53;
    updated_at: UpdatedAt50;
    deleted_at: DeletedAt31;
}

export interface Id97 {
    type: string;
    title: string;
    description: string;
}

export interface Name21 {
    type: string;
    title: string;
    description: string;
}

export interface FulfillmentSetId {
    type: string;
    title: string;
    description: string;
}

export interface FulfillmentSet2 {
    type: string;
}

export interface GeoZones {
    type: string;
    description: string;
    items: Items317;
}

export interface Items317 {
    $ref: string;
}

export interface ShippingOptions {
    type: string;
    description: string;
    items: Items318;
}

export interface Items318 {
    $ref: string;
}

export interface CreatedAt53 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt50 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt31 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminServiceZoneDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties309;
}

export interface Properties309 {
    id: Id98;
    object: Object22;
    deleted: Deleted27;
    parent: Parent6;
}

export interface Id98 {
    type: string;
    title: string;
    description: string;
}

export interface Object22 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted27 {
    type: string;
    title: string;
    description: string;
}

export interface Parent6 {
    $ref: string;
}

export interface AdminServiceZoneResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties310;
}

export interface Properties310 {
    service_zone: ServiceZone;
}

export interface ServiceZone {
    $ref: string;
}

export interface AdminShippingOption {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties311;
}

export interface Properties311 {
    id: Id99;
    name: Name22;
    price_type: PriceType2;
    service_zone_id: ServiceZoneId2;
    service_zone: ServiceZone2;
    provider_id: ProviderId8;
    provider: Provider2;
    shipping_option_type_id: ShippingOptionTypeId;
    type: Type17;
    shipping_profile_id: ShippingProfileId4;
    shipping_profile: ShippingProfile2;
    rules: Rules9;
    prices: Prices7;
    data: Data12;
    metadata: Metadata81;
    created_at: CreatedAt54;
    updated_at: UpdatedAt51;
    deleted_at: DeletedAt32;
}

export interface Id99 {
    type: string;
    title: string;
    description: string;
}

export interface Name22 {
    type: string;
    title: string;
    description: string;
}

export interface PriceType2 {
    type: string;
    description: string;
    enum: string[];
}

export interface ServiceZoneId2 {
    type: string;
    title: string;
    description: string;
}

export interface ServiceZone2 {
    type: string;
}

export interface ProviderId8 {
    type: string;
    title: string;
    description: string;
}

export interface Provider2 {
    $ref: string;
}

export interface ShippingOptionTypeId {
    type: string;
    title: string;
    description: string;
}

export interface Type17 {
    $ref: string;
}

export interface ShippingProfileId4 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingProfile2 {
    $ref: string;
}

export interface Rules9 {
    type: string;
    description: string;
    items: Items319;
}

export interface Items319 {
    $ref: string;
}

export interface Prices7 {
    type: string;
    description: string;
    items: Items320;
}

export interface Items320 {
    $ref: string;
}

export interface Data12 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs96 {
    url: string;
}

export interface Metadata81 {
    type: string;
    description: string;
}

export interface CreatedAt54 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt51 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt32 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminShippingOptionDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties312;
}

export interface Properties312 {
    id: Id100;
    object: Object23;
    deleted: Deleted28;
}

export interface Id100 {
    type: string;
    title: string;
    description: string;
}

export interface Object23 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted28 {
    type: string;
    title: string;
    description: string;
}

export interface AdminShippingOptionPrice {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties313;
}

export interface Properties313 {
    price_rules: PriceRules;
    rules_count: RulesCount;
    id: Id101;
    title: Title23;
    currency_code: CurrencyCode16;
    amount: Amount12;
    raw_amount: RawAmount3;
    min_quantity: MinQuantity5;
    max_quantity: MaxQuantity6;
    price_set_id: PriceSetId3;
    created_at: CreatedAt55;
    updated_at: UpdatedAt52;
    deleted_at: DeletedAt33;
}

export interface PriceRules {
    type: string;
    description: string;
    items: Items321;
}

export interface Items321 {
    $ref: string;
}

export interface RulesCount {
    type: string;
    title: string;
    description: string;
}

export interface Id101 {
    type: string;
    title: string;
    description: string;
}

export interface Title23 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode16 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Amount12 {
    type: string;
    title: string;
    description: string;
}

export interface RawAmount3 {
    type: string;
    description: string;
}

export interface MinQuantity5 {
    type: string;
    title: string;
    description: string;
}

export interface MaxQuantity6 {
    type: string;
    title: string;
    description: string;
}

export interface PriceSetId3 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt55 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt52 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt33 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminShippingOptionPriceRule {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties314;
}

export interface Properties314 {
    id: Id102;
    value: Value15;
    operator: Operator4;
    attribute: Attribute6;
    price_id: PriceId;
    priority: Priority;
    created_at: CreatedAt56;
    updated_at: UpdatedAt53;
    deleted_at: DeletedAt34;
}

export interface Id102 {
    type: string;
    title: string;
    description: string;
}

export interface Value15 {
    oneOf: OneOf63[];
    description: string;
}

export interface OneOf63 {
    type: string;
    title: string;
    description: string;
}

export interface Operator4 {
    type: string;
    description: string;
    enum: string[];
}

export interface Attribute6 {
    type: string;
    title: string;
    description: string;
}

export interface PriceId {
    type: string;
    title: string;
    description: string;
}

export interface Priority {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt56 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt53 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt34 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminShippingOptionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties315;
}

export interface Properties315 {
    shipping_option: ShippingOption;
}

export interface ShippingOption {
    $ref: string;
}

export interface AdminShippingOptionRule {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties316;
}

export interface Properties316 {
    id: Id103;
    attribute: Attribute7;
    operator: Operator5;
    value: Value16;
    shipping_option_id: ShippingOptionId10;
    created_at: CreatedAt57;
    updated_at: UpdatedAt54;
    deleted_at: DeletedAt35;
}

export interface Id103 {
    type: string;
    title: string;
    description: string;
}

export interface Attribute7 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Operator5 {
    type: string;
    description: string;
    enum: string[];
}

export interface Value16 {
    type: string;
    title: string;
}

export interface ShippingOptionId10 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt57 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt54 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt35 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminShippingOptionType {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties317;
}

export interface Properties317 {
    id: Id104;
    created_at: CreatedAt58;
    updated_at: UpdatedAt55;
    deleted_at: DeletedAt36;
    label: Label8;
    description: Description37;
    code: Code6;
    shipping_option_id: ShippingOptionId11;
}

export interface Id104 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt58 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt55 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt36 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Label8 {
    type: string;
    title: string;
    description: string;
}

export interface Description37 {
    type: string;
    title: string;
    description: string;
}

export interface Code6 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId11 {
    type: string;
    title: string;
    description: string;
}

export interface AdminShippingProfile {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties318;
    "required": string[];
}

export interface Properties318 {
    id: Id105;
    name: Name23;
    type: Type18;
    metadata: Metadata82;
    created_at: CreatedAt59;
    updated_at: UpdatedAt56;
    deleted_at: DeletedAt37;
}

export interface Id105 {
    type: string;
    title: string;
    description: string;
}

export interface Name23 {
    type: string;
    title: string;
    description: string;
}

export interface Type18 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata82 {
    type: string;
    description: string;
}

export interface CreatedAt59 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt56 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt37 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminShippingProfileDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties319;
}

export interface Properties319 {
    id: Id106;
    object: Object24;
    deleted: Deleted29;
}

export interface Id106 {
    type: string;
    title: string;
    description: string;
}

export interface Object24 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted29 {
    type: string;
    title: string;
    description: string;
}

export interface AdminShippingProfileResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties320;
}

export interface Properties320 {
    shipping_profile: ShippingProfile3;
}

export interface ShippingProfile3 {
    $ref: string;
}

export interface AdminStockLocation {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties321;
}

export interface Properties321 {
    id: Id107;
    name: Name24;
    address_id: AddressId2;
    address: Address4;
    sales_channels: SalesChannels4;
    fulfillment_providers: FulfillmentProviders2;
    fulfillment_sets: FulfillmentSets;
}

export interface Id107 {
    type: string;
    title: string;
    description: string;
}

export interface Name24 {
    type: string;
    title: string;
    description: string;
}

export interface AddressId2 {
    type: string;
    title: string;
    description: string;
}

export interface Address4 {
    $ref: string;
}

export interface SalesChannels4 {
    type: string;
    description: string;
    items: Items322;
}

export interface Items322 {
    $ref: string;
}

export interface FulfillmentProviders2 {
    type: string;
    description: string;
    items: Items323;
}

export interface Items323 {
    $ref: string;
}

export interface FulfillmentSets {
    type: string;
    description: string;
    items: Items324;
}

export interface Items324 {
    type: string;
}

export interface AdminStockLocationAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties322;
    "required": string[];
}

export interface Properties322 {
    id: Id108;
    address_1: Address17;
    address_2: Address27;
    company: Company7;
    country_code: CountryCode9;
    city: City8;
    phone: Phone8;
    postal_code: PostalCode7;
    province: Province7;
}

export interface Id108 {
    type: string;
    title: string;
    description: string;
}

export interface Address17 {
    type: string;
    title: string;
    description: string;
}

export interface Address27 {
    type: string;
    title: string;
    description: string;
}

export interface Company7 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode9 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface City8 {
    type: string;
    title: string;
    description: string;
}

export interface Phone8 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode7 {
    type: string;
    title: string;
    description: string;
}

export interface Province7 {
    type: string;
    title: string;
    description: string;
}

export interface AdminStockLocationDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties323;
}

export interface Properties323 {
    id: Id109;
    object: Object25;
    deleted: Deleted30;
}

export interface Id109 {
    type: string;
    title: string;
    description: string;
}

export interface Object25 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted30 {
    type: string;
    title: string;
    description: string;
}

export interface AdminStockLocationListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties324;
}

export interface Properties324 {
    limit: Limit21;
    offset: Offset20;
    count: Count20;
    stock_locations: StockLocations;
}

export interface Limit21 {
    type: string;
    title: string;
    description: string;
}

export interface Offset20 {
    type: string;
    title: string;
    description: string;
}

export interface Count20 {
    type: string;
    title: string;
    description: string;
}

export interface StockLocations {
    type: string;
    description: string;
    items: Items325;
}

export interface Items325 {
    $ref: string;
}

export interface AdminStockLocationResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties325;
}

export interface Properties325 {
    stock_location: StockLocation;
}

export interface StockLocation {
    $ref: string;
}

export interface AdminStore {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties326;
}

export interface Properties326 {
    id: Id110;
    name: Name25;
    supported_currencies: SupportedCurrencies;
    default_sales_channel_id: DefaultSalesChannelId;
    default_region_id: DefaultRegionId;
    default_location_id: DefaultLocationId;
    metadata: Metadata83;
    created_at: CreatedAt60;
    updated_at: UpdatedAt57;
}

export interface Id110 {
    type: string;
    title: string;
    description: string;
}

export interface Name25 {
    type: string;
    title: string;
    description: string;
}

export interface SupportedCurrencies {
    type: string;
    description: string;
    items: Items326;
}

export interface Items326 {
    $ref: string;
}

export interface DefaultSalesChannelId {
    type: string;
    title: string;
    description: string;
}

export interface DefaultRegionId {
    type: string;
    title: string;
    description: string;
}

export interface DefaultLocationId {
    type: string;
    title: string;
    description: string;
}

export interface Metadata83 {
    type: string;
    description: string;
}

export interface CreatedAt60 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt57 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminStoreCurrency {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties327;
}

export interface Properties327 {
    id: Id111;
    currency_code: CurrencyCode17;
    store_id: StoreId;
    is_default: IsDefault2;
    currency: Currency3;
    created_at: CreatedAt61;
    updated_at: UpdatedAt58;
    deleted_at: DeletedAt38;
}

export interface Id111 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode17 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface StoreId {
    type: string;
    title: string;
    description: string;
}

export interface IsDefault2 {
    type: string;
    title: string;
    description: string;
}

export interface Currency3 {
    $ref: string;
}

export interface CreatedAt61 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt58 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt38 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminStoreListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties328;
}

export interface Properties328 {
    limit: Limit22;
    offset: Offset21;
    count: Count21;
    stores: Stores;
}

export interface Limit22 {
    type: string;
    title: string;
    description: string;
}

export interface Offset21 {
    type: string;
    title: string;
    description: string;
}

export interface Count21 {
    type: string;
    title: string;
    description: string;
}

export interface Stores {
    type: string;
    description: string;
    items: Items327;
}

export interface Items327 {
    $ref: string;
}

export interface AdminStoreResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties329;
}

export interface Properties329 {
    store: Store;
}

export interface Store {
    $ref: string;
}

export interface AdminTaxRate {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties330;
}

export interface Properties330 {
    id: Id112;
    rate: Rate3;
    code: Code7;
    name: Name26;
    metadata: Metadata84;
    tax_region_id: TaxRegionId2;
    is_combinable: IsCombinable3;
    is_default: IsDefault3;
    created_at: CreatedAt62;
    updated_at: UpdatedAt59;
    deleted_at: DeletedAt39;
    created_by: CreatedBy8;
    tax_region: TaxRegion;
    rules: Rules10;
}

export interface Id112 {
    type: string;
    title: string;
    description: string;
}

export interface Rate3 {
    type: string;
    title: string;
    description: string;
    example: number;
}

export interface Code7 {
    type: string;
    title: string;
    description: string;
}

export interface Name26 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata84 {
    type: string;
    description: string;
}

export interface TaxRegionId2 {
    type: string;
    title: string;
    description: string;
}

export interface IsCombinable3 {
    type: string;
    title: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs97 {
    url: string;
}

export interface IsDefault3 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt62 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt59 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt39 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedBy8 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRegion {
    $ref: string;
}

export interface Rules10 {
    type: string;
    description: string;
    items: Items328;
}

export interface Items328 {
    $ref: string;
}

export interface AdminTaxRateDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties331;
}

export interface Properties331 {
    id: Id113;
    object: Object26;
    deleted: Deleted31;
}

export interface Id113 {
    type: string;
    title: string;
    description: string;
}

export interface Object26 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted31 {
    type: string;
    title: string;
    description: string;
}

export interface AdminTaxRateResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties332;
}

export interface Properties332 {
    tax_rate: TaxRate;
}

export interface TaxRate {
    $ref: string;
}

export interface AdminTaxRateRule {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties333;
}

export interface Properties333 {
    reference: Reference3;
    reference_id: ReferenceId3;
}

export interface Reference3 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ReferenceId3 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface AdminTaxRegion {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties334;
}

export interface Properties334 {
    id: Id114;
    country_code: CountryCode10;
    province_code: ProvinceCode3;
    metadata: Metadata85;
    parent_id: ParentId2;
    created_at: CreatedAt63;
    updated_at: UpdatedAt60;
    deleted_at: DeletedAt40;
    created_by: CreatedBy9;
    tax_rates: TaxRates;
    parent: Parent7;
    children: Children;
}

export interface Id114 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode10 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ProvinceCode3 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata85 {
    type: string;
    description: string;
}

export interface ParentId2 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt63 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt60 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt40 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedBy9 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRates {
    type: string;
    description: string;
    items: Items329;
}

export interface Items329 {
    type: string;
}

export interface Parent7 {
    type: string;
}

export interface Children {
    type: string;
    description: string;
    items: Items330;
}

export interface Items330 {
    type: string;
}

export interface AdminTaxRegionDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties335;
}

export interface Properties335 {
    id: Id115;
    object: Object27;
    deleted: Deleted32;
}

export interface Id115 {
    type: string;
    title: string;
    description: string;
}

export interface Object27 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted32 {
    type: string;
    title: string;
    description: string;
}

export interface AdminTaxRegionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties336;
}

export interface Properties336 {
    tax_region: TaxRegion2;
}

export interface TaxRegion2 {
    $ref: string;
}

export interface AdminTransferOrder {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties337;
}

export interface Properties337 {
    customer_id: CustomerId6;
    description: Description38;
    internal_note: InternalNote30;
}

export interface CustomerId6 {
    type: string;
    title: string;
    description: string;
}

export interface Description38 {
    type: string;
    title: string;
    description: string;
}

export interface InternalNote30 {
    type: string;
    title: string;
    description: string;
}

export interface AdminUpdateApiKey {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties338;
}

export interface Properties338 {
    title: Title24;
}

export interface Title24 {
    type: string;
    title: string;
    description: string;
}

export interface AdminUpdateCollection {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties339;
}

export interface Properties339 {
    title: Title25;
    handle: Handle8;
    metadata: Metadata86;
}

export interface Title25 {
    type: string;
    title: string;
    description: string;
}

export interface Handle8 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata86 {
    type: string;
    description: string;
}

export interface AdminUpdateCustomerGroup {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties340;
}

export interface Properties340 {
    name: Name27;
    metadata: Metadata87;
}

export interface Name27 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata87 {
    type: string;
    description: string;
}

export interface AdminUpdateDraftOrder {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties341;
}

export interface Properties341 {
    email: Email7;
    shipping_address: ShippingAddress4;
    billing_address: BillingAddress4;
    metadata: Metadata90;
}

export interface Email7 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface ShippingAddress4 {
    type: string;
    description: string;
    properties: Properties342;
}

export interface Properties342 {
    first_name: FirstName9;
    last_name: LastName9;
    phone: Phone9;
    company: Company8;
    address_1: Address18;
    address_2: Address28;
    city: City9;
    country_code: CountryCode11;
    province: Province8;
    postal_code: PostalCode8;
    metadata: Metadata88;
}

export interface FirstName9 {
    type: string;
    title: string;
    description: string;
}

export interface LastName9 {
    type: string;
    title: string;
    description: string;
}

export interface Phone9 {
    type: string;
    title: string;
    description: string;
}

export interface Company8 {
    type: string;
    title: string;
    description: string;
}

export interface Address18 {
    type: string;
    title: string;
    description: string;
}

export interface Address28 {
    type: string;
    title: string;
    description: string;
}

export interface City9 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode11 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Province8 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode8 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata88 {
    type: string;
    description: string;
}

export interface BillingAddress4 {
    type: string;
    description: string;
    properties: Properties343;
}

export interface Properties343 {
    first_name: FirstName10;
    last_name: LastName10;
    phone: Phone10;
    company: Company9;
    address_1: Address19;
    address_2: Address29;
    city: City10;
    country_code: CountryCode12;
    province: Province9;
    postal_code: PostalCode9;
    metadata: Metadata89;
}

export interface FirstName10 {
    type: string;
    title: string;
    description: string;
}

export interface LastName10 {
    type: string;
    title: string;
    description: string;
}

export interface Phone10 {
    type: string;
    title: string;
    description: string;
}

export interface Company9 {
    type: string;
    title: string;
    description: string;
}

export interface Address19 {
    type: string;
    title: string;
    description: string;
}

export interface Address29 {
    type: string;
    title: string;
    description: string;
}

export interface City10 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode12 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Province9 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode9 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata89 {
    type: string;
    description: string;
}

export interface Metadata90 {
    type: string;
    description: string;
}

export interface AdminUpdateOrder {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties344;
}

export interface Properties344 {
    email: Email8;
    shipping_address: ShippingAddress5;
    billing_address: BillingAddress5;
    metadata: Metadata93;
}

export interface Email8 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface ShippingAddress5 {
    type: string;
    description: string;
    properties: Properties345;
}

export interface Properties345 {
    first_name: FirstName11;
    last_name: LastName11;
    phone: Phone11;
    company: Company10;
    address_1: Address110;
    address_2: Address210;
    city: City11;
    country_code: CountryCode13;
    province: Province10;
    postal_code: PostalCode10;
    metadata: Metadata91;
}

export interface FirstName11 {
    type: string;
    title: string;
    description: string;
}

export interface LastName11 {
    type: string;
    title: string;
    description: string;
}

export interface Phone11 {
    type: string;
    title: string;
    description: string;
}

export interface Company10 {
    type: string;
    title: string;
    description: string;
}

export interface Address110 {
    type: string;
    title: string;
    description: string;
}

export interface Address210 {
    type: string;
    title: string;
    description: string;
}

export interface City11 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode13 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Province10 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode10 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata91 {
    type: string;
    description: string;
}

export interface BillingAddress5 {
    type: string;
    description: string;
    properties: Properties346;
}

export interface Properties346 {
    first_name: FirstName12;
    last_name: LastName12;
    phone: Phone12;
    company: Company11;
    address_1: Address111;
    address_2: Address211;
    city: City12;
    country_code: CountryCode14;
    province: Province11;
    postal_code: PostalCode11;
    metadata: Metadata92;
}

export interface FirstName12 {
    type: string;
    title: string;
    description: string;
}

export interface LastName12 {
    type: string;
    title: string;
    description: string;
}

export interface Phone12 {
    type: string;
    title: string;
    description: string;
}

export interface Company11 {
    type: string;
    title: string;
    description: string;
}

export interface Address111 {
    type: string;
    title: string;
    description: string;
}

export interface Address211 {
    type: string;
    title: string;
    description: string;
}

export interface City12 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode14 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Province11 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode11 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata92 {
    type: string;
    description: string;
}

export interface Metadata93 {
    type: string;
    description: string;
}

export interface AdminUpdatePriceList {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties347;
}

export interface Properties347 {
    title: Title26;
    description: Description39;
    starts_at: StartsAt4;
    ends_at: EndsAt4;
    status: Status14;
    type: Type19;
    rules: Rules11;
}

export interface Title26 {
    type: string;
    title: string;
    description: string;
}

export interface Description39 {
    type: string;
    title: string;
    description: string;
}

export interface StartsAt4 {
    type: string;
    title: string;
    description: string;
}

export interface EndsAt4 {
    type: string;
    title: string;
    description: string;
}

export interface Status14 {
    type: string;
    description: string;
    enum: string[];
}

export interface Type19 {
    type: string;
    description: string;
    enum: string[];
}

export interface Rules11 {
    type: string;
    description: string;
    example: Example10;
}

export interface Example10 {
    customer_group_id: string[];
}

export interface AdminUpdatePricePreference {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties348;
}

export interface Properties348 {
    attribute: Attribute8;
    value: Value17;
    is_tax_inclusive: IsTaxInclusive8;
}

export interface Attribute8 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Value17 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface IsTaxInclusive8 {
    type: string;
    title: string;
    description: string;
}

export interface AdminUpdateProduct {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties349;
}

export interface Properties349 {
    title: Title27;
    subtitle: Subtitle6;
    description: Description40;
    is_giftcard: IsGiftcard4;
    discountable: Discountable4;
    images: Images4;
    thumbnail: Thumbnail8;
    handle: Handle9;
    status: Status15;
    type_id: TypeId4;
    collection_id: CollectionId4;
    categories: Categories4;
    tags: Tags4;
    options: Options8;
    variants: Variants4;
    sales_channels: SalesChannels5;
    weight: Weight9;
    length: Length9;
    height: Height9;
    width: Width9;
    hs_code: HsCode9;
    mid_code: MidCode9;
    origin_country: OriginCountry9;
    material: Material9;
    metadata: Metadata94;
    external_id: ExternalId6;
}

export interface Title27 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle6 {
    type: string;
    title: string;
    description: string;
}

export interface Description40 {
    type: string;
    title: string;
    description: string;
}

export interface IsGiftcard4 {
    type: string;
    title: string;
    description: string;
}

export interface Discountable4 {
    type: string;
    title: string;
    description: string;
}

export interface Images4 {
    type: string;
    description: string;
    items: Items331;
}

export interface Items331 {
    type: string;
    description: string;
    required: string[];
    properties: Properties350;
}

export interface Properties350 {
    url: Url5;
}

export interface Url5 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail8 {
    type: string;
    title: string;
    description: string;
}

export interface Handle9 {
    type: string;
    title: string;
    description: string;
}

export interface Status15 {
    type: string;
    description: string;
    enum: string[];
}

export interface TypeId4 {
    type: string;
    title: string;
    description: string;
}

export interface CollectionId4 {
    type: string;
    title: string;
    description: string;
}

export interface Categories4 {
    type: string;
    description: string;
    items: Items332;
}

export interface Items332 {
    type: string;
    description: string;
    required: string[];
    properties: Properties351;
}

export interface Properties351 {
    id: Id116;
}

export interface Id116 {
    type: string;
    title: string;
    description: string;
}

export interface Tags4 {
    type: string;
    description: string;
    items: Items333;
}

export interface Items333 {
    type: string;
    description: string;
    required: string[];
    properties: Properties352;
}

export interface Properties352 {
    id: Id117;
}

export interface Id117 {
    type: string;
    title: string;
    description: string;
}

export interface Options8 {
    type: string;
    description: string;
    items: Items334;
}

export interface Items334 {
    $ref: string;
}

export interface Variants4 {
    type: string;
    description: string;
    items: Items335;
}

export interface Items335 {
    oneOf: OneOf64[];
}

export interface OneOf64 {
    $ref: string;
}

export interface SalesChannels5 {
    type: string;
    description: string;
    items: Items336;
}

export interface Items336 {
    type: string;
    description: string;
    required: string[];
    properties: Properties353;
}

export interface Properties353 {
    id: Id118;
}

export interface Id118 {
    type: string;
    title: string;
    description: string;
}

export interface Weight9 {
    type: string;
    title: string;
    description: string;
}

export interface Length9 {
    type: string;
    title: string;
    description: string;
}

export interface Height9 {
    type: string;
    title: string;
    description: string;
}

export interface Width9 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode9 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode9 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry9 {
    type: string;
    title: string;
    description: string;
}

export interface Material9 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata94 {
    type: string;
    description: string;
}

export interface ExternalId6 {
    type: string;
    title: string;
    description: string;
}

export interface AdminUpdateProductOption {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties354;
}

export interface Properties354 {
    title: Title28;
    values: Values5;
}

export interface Title28 {
    type: string;
    title: string;
    description: string;
}

export interface Values5 {
    type: string;
    description: string;
    items: Items337;
}

export interface Items337 {
    type: string;
    title: string;
    description: string;
}

export interface AdminUpdateProductVariant {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties355;
}

export interface Properties355 {
    title: Title29;
    sku: Sku8;
    ean: Ean4;
    upc: Upc4;
    barcode: Barcode6;
    hs_code: HsCode10;
    mid_code: MidCode10;
    allow_backorder: AllowBackorder7;
    manage_inventory: ManageInventory4;
    variant_rank: VariantRank4;
    weight: Weight10;
    length: Length10;
    height: Height10;
    width: Width10;
    origin_country: OriginCountry10;
    material: Material10;
    metadata: Metadata95;
    prices: Prices8;
    options: Options9;
}

export interface Title29 {
    type: string;
    title: string;
    description: string;
}

export interface Sku8 {
    type: string;
    title: string;
    description: string;
}

export interface Ean4 {
    type: string;
    title: string;
    description: string;
}

export interface Upc4 {
    type: string;
    title: string;
    description: string;
}

export interface Barcode6 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode10 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode10 {
    type: string;
    title: string;
    description: string;
}

export interface AllowBackorder7 {
    type: string;
    title: string;
    description: string;
}

export interface ManageInventory4 {
    type: string;
    title: string;
    description: string;
}

export interface VariantRank4 {
    type: string;
    title: string;
    description: string;
}

export interface Weight10 {
    type: string;
    title: string;
    description: string;
}

export interface Length10 {
    type: string;
    title: string;
    description: string;
}

export interface Height10 {
    type: string;
    title: string;
    description: string;
}

export interface Width10 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry10 {
    type: string;
    title: string;
    description: string;
}

export interface Material10 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata95 {
    type: string;
    description: string;
}

export interface Prices8 {
    type: string;
    description: string;
    items: Items338;
}

export interface Items338 {
    $ref: string;
}

export interface Options9 {
    type: string;
    description: string;
}

export interface AdminUpdatePromotionRule {
    "type": string;
    "description": string;
    "required": string[];
    "properties": Properties356;
    "x-schemaName": string;
}

export interface Properties356 {
    id: Id119;
    operator: Operator6;
    description: Description41;
    attribute: Attribute9;
    values: Values6;
}

export interface Id119 {
    type: string;
    title: string;
    description: string;
}

export interface Operator6 {
    type: string;
    description: string;
    enum: string[];
}

export interface Description41 {
    type: string;
    title: string;
    description: string;
}

export interface Attribute9 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Values6 {
    oneOf: OneOf65[];
}

export interface OneOf65 {
    type: string;
    title?: string;
    description: string;
    example?: string;
    items?: Items339;
}

export interface Items339 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface AdminUpdateReturnReason {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties357;
    "required": string[];
}

export interface Properties357 {
    label: Label9;
    value: Value18;
    description: Description42;
    metadata: Metadata96;
}

export interface Label9 {
    type: string;
    title: string;
    description: string;
}

export interface Value18 {
    type: string;
    title: string;
    description: string;
}

export interface Description42 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata96 {
    type: string;
    description: string;
}

export interface AdminUpdateSalesChannel {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties358;
}

export interface Properties358 {
    name: Name28;
    description: Description43;
    is_disabled: IsDisabled3;
    metadata: Metadata97;
}

export interface Name28 {
    type: string;
    title: string;
    description: string;
}

export interface Description43 {
    type: string;
    title: string;
    description: string;
}

export interface IsDisabled3 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata97 {
    type: string;
    description: string;
}

export interface AdminUpdateShippingOptionRule {
    "type": string;
    "description": string;
    "required": string[];
    "properties": Properties359;
    "x-schemaName": string;
}

export interface Properties359 {
    id: Id120;
    operator: Operator7;
    attribute: Attribute10;
    value: Value19;
}

export interface Id120 {
    type: string;
    title: string;
    description: string;
}

export interface Operator7 {
    type: string;
    description: string;
    enum: string[];
}

export interface Attribute10 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Value19 {
    oneOf: OneOf66[];
}

export interface OneOf66 {
    type: string;
    title?: string;
    description: string;
    example?: string;
    items?: Items340;
}

export interface Items340 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface AdminUpdateStockLocation {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties360;
}

export interface Properties360 {
    name: Name29;
    address: Address5;
    address_id: AddressId3;
    metadata: Metadata98;
}

export interface Name29 {
    type: string;
    title: string;
    description: string;
}

export interface Address5 {
    type: string;
    description: string;
    required: string[];
    properties: Properties361;
}

export interface Properties361 {
    address_1: Address112;
    address_2: Address212;
    company: Company12;
    city: City13;
    country_code: CountryCode15;
    phone: Phone13;
    postal_code: PostalCode12;
    province: Province12;
}

export interface Address112 {
    type: string;
    title: string;
    description: string;
}

export interface Address212 {
    type: string;
    title: string;
    description: string;
}

export interface Company12 {
    type: string;
    title: string;
    description: string;
}

export interface City13 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode15 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Phone13 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode12 {
    type: string;
    title: string;
    description: string;
}

export interface Province12 {
    type: string;
    title: string;
    description: string;
}

export interface AddressId3 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata98 {
    type: string;
    description: string;
}

export interface AdminUpdateStore {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties362;
}

export interface Properties362 {
    name: Name30;
    supported_currencies: SupportedCurrencies2;
    default_sales_channel_id: DefaultSalesChannelId2;
    default_region_id: DefaultRegionId2;
    default_location_id: DefaultLocationId2;
    metadata: Metadata99;
}

export interface Name30 {
    type: string;
    title: string;
    description: string;
}

export interface SupportedCurrencies2 {
    type: string;
    description: string;
    items: Items341;
}

export interface Items341 {
    type: string;
    description: string;
    required: string[];
    properties: Properties363;
}

export interface Properties363 {
    currency_code: CurrencyCode18;
    is_default: IsDefault4;
    is_tax_inclusive: IsTaxInclusive9;
}

export interface CurrencyCode18 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface IsDefault4 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive9 {
    type: string;
    title: string;
    description: string;
}

export interface DefaultSalesChannelId2 {
    type: string;
    title: string;
    description: string;
}

export interface DefaultRegionId2 {
    type: string;
    title: string;
    description: string;
}

export interface DefaultLocationId2 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata99 {
    type: string;
    description: string;
}

export interface AdminUpdateTaxRate {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties364;
}

export interface Properties364 {
    rate: Rate4;
    code: Code8;
    rules: Rules12;
    name: Name31;
    is_default: IsDefault5;
    is_combinable: IsCombinable4;
    metadata: Metadata100;
}

export interface Rate4 {
    type: string;
    title: string;
    description: string;
}

export interface Code8 {
    type: string;
    title: string;
    description: string;
}

export interface Rules12 {
    type: string;
    description: string;
    items: Items342;
}

export interface Items342 {
    type: string;
    description: string;
    required: string[];
    properties: Properties365;
}

export interface Properties365 {
    reference: Reference4;
    reference_id: ReferenceId4;
}

export interface Reference4 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ReferenceId4 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Name31 {
    type: string;
    title: string;
    description: string;
}

export interface IsDefault5 {
    type: string;
    title: string;
    description: string;
}

export interface IsCombinable4 {
    type: string;
    title: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs98 {
    url: string;
}

export interface Metadata100 {
    type: string;
    description: string;
}

export interface AdminUpdateTaxRegion {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties366;
}

export interface Properties366 {
    province_code: ProvinceCode4;
    metadata: Metadata101;
}

export interface ProvinceCode4 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata101 {
    type: string;
    description: string;
}

export interface AdminUpdateUser {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties367;
}

export interface Properties367 {
    first_name: FirstName13;
    last_name: LastName13;
    avatar_url: AvatarUrl;
    metadata: Metadata102;
}

export interface FirstName13 {
    type: string;
    title: string;
    description: string;
}

export interface LastName13 {
    type: string;
    title: string;
    description: string;
}

export interface AvatarUrl {
    type: string;
    title: string;
    description: string;
}

export interface Metadata102 {
    type: string;
    description: string;
}

export interface AdminUpdateVariantInventoryItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties368;
}

export interface Properties368 {
    required_quantity: RequiredQuantity3;
}

export interface RequiredQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface AdminUpsertStockLocationAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties369;
}

export interface Properties369 {
    address_1: Address113;
    address_2: Address213;
    company: Company13;
    country_code: CountryCode16;
    city: City14;
    phone: Phone14;
    postal_code: PostalCode13;
    province: Province13;
}

export interface Address113 {
    type: string;
    title: string;
    description: string;
}

export interface Address213 {
    type: string;
    title: string;
    description: string;
}

export interface Company13 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode16 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface City14 {
    type: string;
    title: string;
    description: string;
}

export interface Phone14 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode13 {
    type: string;
    title: string;
    description: string;
}

export interface Province13 {
    type: string;
    title: string;
    description: string;
}

export interface AdminUser {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties370;
}

export interface Properties370 {
    id: Id121;
    email: Email9;
    first_name: FirstName14;
    last_name: LastName14;
    avatar_url: AvatarUrl2;
    metadata: Metadata103;
    created_at: CreatedAt64;
    updated_at: UpdatedAt61;
    deleted_at: DeletedAt41;
}

export interface Id121 {
    type: string;
    title: string;
    description: string;
}

export interface Email9 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface FirstName14 {
    type: string;
    title: string;
    description: string;
}

export interface LastName14 {
    type: string;
    title: string;
    description: string;
}

export interface AvatarUrl2 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata103 {
    type: string;
    description: string;
}

export interface CreatedAt64 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt61 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt41 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminUserDeleteResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties371;
}

export interface Properties371 {
    id: Id122;
    object: Object28;
    deleted: Deleted33;
}

export interface Id122 {
    type: string;
    title: string;
    description: string;
}

export interface Object28 {
    type: string;
    title: string;
    description: string;
    default: string;
}

export interface Deleted33 {
    type: string;
    title: string;
    description: string;
}

export interface AdminUserListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties372;
}

export interface Properties372 {
    limit: Limit23;
    offset: Offset22;
    count: Count22;
    users: Users;
}

export interface Limit23 {
    type: string;
    title: string;
    description: string;
}

export interface Offset22 {
    type: string;
    title: string;
    description: string;
}

export interface Count22 {
    type: string;
    title: string;
    description: string;
}

export interface Users {
    type: string;
    description: string;
    items: Items343;
}

export interface Items343 {
    $ref: string;
}

export interface AdminUserResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties373;
}

export interface Properties373 {
    user: User;
}

export interface User {
    $ref: string;
}

export interface AdminWorkflowExecution {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties374;
}

export interface Properties374 {
    id: Id123;
    workflow_id: WorkflowId;
    transaction_id: TransactionId5;
    execution: Execution;
    context: Context2;
    state: State;
    created_at: CreatedAt65;
    updated_at: UpdatedAt62;
    deleted_at: DeletedAt42;
}

export interface Id123 {
    type: string;
    title: string;
    description: string;
}

export interface WorkflowId {
    type: string;
    title: string;
    description: string;
}

export interface TransactionId5 {
    type: string;
    title: string;
    description: string;
}

export interface Execution {
    $ref: string;
}

export interface Context2 {
    $ref: string;
}

export interface State {
    type: string;
    description: string;
    enum: string[];
}

export interface CreatedAt65 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt62 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt42 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AdminWorkflowExecutionExecution {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties375;
}

export interface Properties375 {
    steps: Steps;
}

export interface Steps {
    type: string;
    description: string;
    required: string[];
    additionalProperties: AdditionalProperties;
}

export interface AdditionalProperties {
    type: string;
    properties: Properties376;
}

export interface Properties376 {
    id: Id124;
    invoke: Invoke;
    definition: Definition;
    compensate: Compensate;
    depth: Depth;
    startedAt: StartedAt;
}

export interface Id124 {
    type: string;
    title: string;
    description: string;
}

export interface Invoke {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties377;
    "required": string[];
}

export interface Properties377 {
    state: State2;
    status: Status16;
}

export interface State2 {
    type: string;
    description: string;
    enum: string[];
}

export interface Status16 {
    type: string;
    description: string;
    enum: string[];
}

export interface Definition {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties378;
}

export interface Properties378 {
    async: Async;
    compensateAsync: CompensateAsync;
    noCompensation: NoCompensation;
    continueOnPermanentFailure: ContinueOnPermanentFailure;
    maxRetries: MaxRetries;
    noWait: NoWait;
    retryInterval: RetryInterval;
    retryIntervalAwaiting: RetryIntervalAwaiting;
    saveResponse: SaveResponse;
    timeout: Timeout;
}

export interface Async {
    type: string;
    title: string;
    description: string;
}

export interface CompensateAsync {
    type: string;
    title: string;
    description: string;
}

export interface NoCompensation {
    type: string;
    title: string;
    description: string;
}

export interface ContinueOnPermanentFailure {
    type: string;
    title: string;
    description: string;
}

export interface MaxRetries {
    type: string;
    title: string;
    description: string;
}

export interface NoWait {
    type: string;
    title: string;
    description: string;
    default: boolean;
}

export interface RetryInterval {
    type: string;
    title: string;
    description: string;
}

export interface RetryIntervalAwaiting {
    type: string;
    title: string;
    description: string;
}

export interface SaveResponse {
    type: string;
    title: string;
    description: string;
}

export interface Timeout {
    type: string;
    title: string;
    description: string;
}

export interface Compensate {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties379;
    "required": string[];
}

export interface Properties379 {
    state: State3;
    status: Status17;
}

export interface State3 {
    type: string;
    description: string;
    enum: string[];
}

export interface Status17 {
    type: string;
    description: string;
    enum: string[];
}

export interface Depth {
    type: string;
    title: string;
    description: string;
}

export interface StartedAt {
    type: string;
    title: string;
    description: string;
}

export interface AdminWorkflowExecutionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties380;
}

export interface Properties380 {
    workflow_execution: WorkflowExecution;
}

export interface WorkflowExecution {
    $ref: string;
}

export interface ApiKeyResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties381;
}

export interface Properties381 {
    id: Id125;
    token: Token3;
    redacted: Redacted2;
    title: Title30;
    type: Type20;
    last_used_at: LastUsedAt2;
    created_by: CreatedBy10;
    created_at: CreatedAt66;
    revoked_by: RevokedBy2;
    revoked_at: RevokedAt2;
}

export interface Id125 {
    type: string;
    title: string;
    description: string;
}

export interface Token3 {
    type: string;
    title: string;
    description: string;
}

export interface Redacted2 {
    type: string;
    title: string;
    description: string;
}

export interface Title30 {
    type: string;
    title: string;
    description: string;
}

export interface Type20 {
    type: string;
    description: string;
    enum: string[];
}

export interface LastUsedAt2 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CreatedBy10 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt66 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface RevokedBy2 {
    type: string;
    title: string;
    description: string;
}

export interface RevokedAt2 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface AuthAdminSessionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties382;
}

export interface Properties382 {
    user: User2;
}

export interface User2 {
    title: string;
    description: string;
    $ref: string;
}

export interface AuthCallbackResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties383;
}

export interface Properties383 {
    location: Location2;
}

export interface Location2 {
    type: string;
    title: string;
    description: string;
}

export interface AuthResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties384;
}

export interface Properties384 {
    token: Token4;
}

export interface Token4 {
    type: string;
    title: string;
    description: string;
}

export interface AuthStoreSessionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties385;
}

export interface Properties385 {
    user: User3;
}

export interface User3 {
    title: string;
    description: string;
    $ref: string;
}

export interface BaseCalculatedPriceSet {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties386;
}

export interface Properties386 {
    id: Id126;
    is_calculated_price_price_list: IsCalculatedPricePriceList;
    is_calculated_price_tax_inclusive: IsCalculatedPriceTaxInclusive;
    calculated_amount: CalculatedAmount;
    calculated_amount_with_tax: CalculatedAmountWithTax;
    calculated_amount_without_tax: CalculatedAmountWithoutTax;
    is_original_price_price_list: IsOriginalPricePriceList;
    is_original_price_tax_inclusive: IsOriginalPriceTaxInclusive;
    original_amount: OriginalAmount;
    currency_code: CurrencyCode19;
    calculated_price: CalculatedPrice2;
    original_price: OriginalPrice;
    original_amount_with_tax: OriginalAmountWithTax;
    original_amount_without_tax: OriginalAmountWithoutTax;
}

export interface Id126 {
    type: string;
    title: string;
    description: string;
}

export interface IsCalculatedPricePriceList {
    type: string;
    title: string;
    description: string;
}

export interface IsCalculatedPriceTaxInclusive {
    type: string;
    title: string;
    description: string;
}

export interface CalculatedAmount {
    type: string;
    title: string;
    description: string;
}

export interface CalculatedAmountWithTax {
    type: string;
    title: string;
    description: string;
}

export interface CalculatedAmountWithoutTax {
    type: string;
    title: string;
    description: string;
}

export interface IsOriginalPricePriceList {
    type: string;
    title: string;
    description: string;
}

export interface IsOriginalPriceTaxInclusive {
    type: string;
    title: string;
    description: string;
}

export interface OriginalAmount {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode19 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface CalculatedPrice2 {
    type: string;
    description: string;
}

export interface OriginalPrice {
    type: string;
    description: string;
}

export interface OriginalAmountWithTax {
    type: string;
    title: string;
    description: string;
}

export interface OriginalAmountWithoutTax {
    type: string;
    title: string;
    description: string;
}

export interface BaseCapture {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties387;
}

export interface Properties387 {
    id: Id127;
    amount: Amount13;
    created_at: CreatedAt67;
    created_by: CreatedBy11;
    payment: Payment4;
}

export interface Id127 {
    type: string;
    title: string;
    description: string;
}

export interface Amount13 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt67 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedBy11 {
    type: string;
    title: string;
    description: string;
}

export interface Payment4 {
    type: string;
}

export interface BaseCart {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties388;
}

export interface Properties388 {
    id: Id128;
    region: Region3;
    region_id: RegionId6;
    customer_id: CustomerId7;
    sales_channel_id: SalesChannelId4;
    email: Email10;
    currency_code: CurrencyCode20;
    shipping_address: ShippingAddress6;
    billing_address: BillingAddress6;
    items: Items344;
    shipping_methods: ShippingMethods6;
    payment_collection: PaymentCollection4;
    metadata: Metadata104;
    created_at: CreatedAt68;
    updated_at: UpdatedAt63;
    original_item_total: OriginalItemTotal4;
    original_item_subtotal: OriginalItemSubtotal4;
    original_item_tax_total: OriginalItemTaxTotal4;
    item_total: ItemTotal6;
    item_subtotal: ItemSubtotal6;
    item_tax_total: ItemTaxTotal6;
    original_total: OriginalTotal8;
    original_subtotal: OriginalSubtotal8;
    original_tax_total: OriginalTaxTotal8;
    total: Total8;
    subtotal: Subtotal8;
    tax_total: TaxTotal8;
    discount_total: DiscountTotal8;
    discount_tax_total: DiscountTaxTotal8;
    gift_card_total: GiftCardTotal4;
    gift_card_tax_total: GiftCardTaxTotal4;
    shipping_total: ShippingTotal4;
    shipping_subtotal: ShippingSubtotal4;
    shipping_tax_total: ShippingTaxTotal4;
    original_shipping_total: OriginalShippingTotal4;
    original_shipping_subtotal: OriginalShippingSubtotal4;
    original_shipping_tax_total: OriginalShippingTaxTotal4;
}

export interface Id128 {
    type: string;
    title: string;
    description: string;
}

export interface Region3 {
    $ref: string;
}

export interface RegionId6 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId7 {
    type: string;
    title: string;
    description: string;
}

export interface SalesChannelId4 {
    type: string;
    title: string;
    description: string;
}

export interface Email10 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CurrencyCode20 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingAddress6 {
    $ref: string;
}

export interface BillingAddress6 {
    $ref: string;
}

export interface Items344 {
    type: string;
    description: string;
    items: Items345;
}

export interface Items345 {
    type: string;
}

export interface ShippingMethods6 {
    type: string;
    description: string;
    items: Items346;
}

export interface Items346 {
    $ref: string;
}

export interface PaymentCollection4 {
    $ref: string;
}

export interface Metadata104 {
    type: string;
    description: string;
}

export interface CreatedAt68 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt63 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalItemTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemSubtotal4 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemTaxTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal6 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal8 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface Total8 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal8 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTaxTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingSubtotal4 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTaxTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingSubtotal4 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTaxTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface BaseCartAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface BaseCartLineItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties389;
}

export interface Properties389 {
    id: Id129;
    title: Title31;
    subtitle: Subtitle7;
    thumbnail: Thumbnail9;
    quantity: Quantity23;
    product: Product7;
    product_id: ProductId5;
    product_title: ProductTitle3;
    product_description: ProductDescription3;
    product_subtitle: ProductSubtitle3;
    product_type: ProductType4;
    product_collection: ProductCollection3;
    product_handle: ProductHandle3;
    variant: Variant5;
    variant_id: VariantId13;
    variant_sku: VariantSku3;
    variant_barcode: VariantBarcode3;
    variant_title: VariantTitle3;
    variant_option_values: VariantOptionValues3;
    requires_shipping: RequiresShipping6;
    is_discountable: IsDiscountable3;
    is_tax_inclusive: IsTaxInclusive10;
    compare_at_unit_price: CompareAtUnitPrice6;
    unit_price: UnitPrice8;
    tax_lines: TaxLines5;
    adjustments: Adjustments5;
    cart: Cart4;
    cart_id: CartId2;
    metadata: Metadata105;
    created_at: CreatedAt69;
    updated_at: UpdatedAt64;
    deleted_at: DeletedAt43;
    original_total: OriginalTotal9;
    original_subtotal: OriginalSubtotal9;
    original_tax_total: OriginalTaxTotal9;
    item_total: ItemTotal7;
    item_subtotal: ItemSubtotal7;
    item_tax_total: ItemTaxTotal7;
    total: Total9;
    subtotal: Subtotal9;
    tax_total: TaxTotal9;
    discount_total: DiscountTotal9;
    discount_tax_total: DiscountTaxTotal9;
}

export interface Id129 {
    type: string;
    title: string;
    description: string;
}

export interface Title31 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle7 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail9 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity23 {
    type: string;
    title: string;
    description: string;
}

export interface Product7 {
    $ref: string;
}

export interface ProductId5 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTitle3 {
    type: string;
    title: string;
    description: string;
}

export interface ProductDescription3 {
    type: string;
    title: string;
    description: string;
}

export interface ProductSubtitle3 {
    type: string;
    title: string;
    description: string;
}

export interface ProductType4 {
    type: string;
    title: string;
    description: string;
}

export interface ProductCollection3 {
    type: string;
    title: string;
    description: string;
}

export interface ProductHandle3 {
    type: string;
    title: string;
    description: string;
}

export interface Variant5 {
    $ref: string;
}

export interface VariantId13 {
    type: string;
    title: string;
    description: string;
}

export interface VariantSku3 {
    type: string;
    title: string;
    description: string;
}

export interface VariantBarcode3 {
    type: string;
    title: string;
    description: string;
}

export interface VariantTitle3 {
    type: string;
    title: string;
    description: string;
}

export interface VariantOptionValues3 {
    type: string;
    description: string;
}

export interface RequiresShipping6 {
    type: string;
    title: string;
    description: string;
}

export interface IsDiscountable3 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive10 {
    type: string;
    title: string;
    description: string;
}

export interface CompareAtUnitPrice6 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice8 {
    type: string;
    title: string;
    description: string;
}

export interface TaxLines5 {
    type: string;
    description: string;
    items: Items347;
}

export interface Items347 {
    type: string;
}

export interface Adjustments5 {
    type: string;
    description: string;
    items: Items348;
}

export interface Items348 {
    $ref: string;
}

export interface Cart4 {
    $ref: string;
}

export interface CartId2 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata105 {
    type: string;
    description: string;
}

export interface CreatedAt69 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt64 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt43 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalTotal9 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal9 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal9 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal7 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface Total9 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal9 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal9 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal9 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal9 {
    type: string;
    title: string;
    description: string;
}

export interface BaseCartShippingMethod {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties390;
}

export interface Properties390 {
    id: Id130;
    cart_id: CartId3;
    name: Name32;
    description: Description44;
    amount: Amount14;
    is_tax_inclusive: IsTaxInclusive11;
    shipping_option_id: ShippingOptionId12;
    data: Data13;
    metadata: Metadata106;
    tax_lines: TaxLines6;
    adjustments: Adjustments6;
    created_at: CreatedAt70;
    updated_at: UpdatedAt65;
    original_total: OriginalTotal10;
    original_subtotal: OriginalSubtotal10;
    original_tax_total: OriginalTaxTotal10;
    total: Total10;
    subtotal: Subtotal10;
    tax_total: TaxTotal10;
    discount_total: DiscountTotal10;
    discount_tax_total: DiscountTaxTotal10;
}

export interface Id130 {
    type: string;
    title: string;
    description: string;
}

export interface CartId3 {
    type: string;
    title: string;
    description: string;
}

export interface Name32 {
    type: string;
    title: string;
    description: string;
}

export interface Description44 {
    type: string;
    title: string;
    description: string;
}

export interface Amount14 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive11 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId12 {
    type: string;
    title: string;
    description: string;
}

export interface Data13 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs99 {
    url: string;
}

export interface Metadata106 {
    type: string;
    description: string;
}

export interface TaxLines6 {
    type: string;
    description: string;
    items: Items349;
}

export interface Items349 {
    $ref: string;
}

export interface Adjustments6 {
    type: string;
    description: string;
    items: Items350;
}

export interface Items350 {
    $ref: string;
}

export interface CreatedAt70 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt65 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalTotal10 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal10 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal10 {
    type: string;
    title: string;
    description: string;
}

export interface Total10 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal10 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal10 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal10 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal10 {
    type: string;
    title: string;
    description: string;
}

export interface BaseClaimItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties391;
}

export interface Properties391 {
    id: Id131;
    claim_id: ClaimId4;
    order_id: OrderId14;
    item_id: ItemId3;
    quantity: Quantity24;
    reason: Reason2;
    raw_quantity: RawQuantity;
    metadata: Metadata107;
    created_at: CreatedAt71;
    updated_at: UpdatedAt66;
}

export interface Id131 {
    type: string;
    title: string;
    description: string;
}

export interface ClaimId4 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId14 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId3 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity24 {
    type: string;
    title: string;
    description: string;
}

export interface Reason2 {
    type: string;
    description: string;
    enum: string[];
}

export interface RawQuantity {
    type: string;
    description: string;
    properties: Properties392;
    required: string[];
}

export interface Properties392 {
    value: Value20;
}

export interface Value20 {
    oneOf: OneOf67[];
}

export interface OneOf67 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata107 {
    type: string;
    description: string;
}

export interface CreatedAt71 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt66 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseCollection {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties393;
}

export interface Properties393 {
    id: Id132;
    title: Title32;
    handle: Handle10;
    created_at: CreatedAt72;
    updated_at: UpdatedAt67;
    deleted_at: DeletedAt44;
    products: Products4;
    metadata: Metadata108;
}

export interface Id132 {
    type: string;
    title: string;
    description: string;
}

export interface Title32 {
    type: string;
    title: string;
    description: string;
}

export interface Handle10 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt72 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt67 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt44 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Products4 {
    type: string;
    description: string;
    items: Items351;
}

export interface Items351 {
    type: string;
}

export interface Metadata108 {
    type: string;
    description: string;
}

export interface BaseExchangeItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties394;
}

export interface Properties394 {
    id: Id133;
    exchange_id: ExchangeId4;
    order_id: OrderId15;
    item_id: ItemId4;
    quantity: Quantity25;
    metadata: Metadata109;
    created_at: CreatedAt73;
    updated_at: UpdatedAt68;
}

export interface Id133 {
    type: string;
    title: string;
    description: string;
}

export interface ExchangeId4 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId15 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId4 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity25 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata109 {
    type: string;
    description: string;
}

export interface CreatedAt73 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt68 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseFulfillmentProvider {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties395;
}

export interface Properties395 {
    id: Id134;
    is_enabled: IsEnabled3;
}

export interface Id134 {
    type: string;
    title: string;
    description: string;
}

export interface IsEnabled3 {
    type: string;
    title: string;
    description: string;
}

export interface BaseLineItemAdjustment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties396;
}

export interface Properties396 {
    item: Item2;
    item_id: ItemId5;
    id: Id135;
    code: Code9;
    amount: Amount15;
    cart_id: CartId4;
    description: Description45;
    promotion_id: PromotionId;
    provider_id: ProviderId9;
    created_at: CreatedAt74;
    updated_at: UpdatedAt69;
}

export interface Item2 {
    type: string;
}

export interface ItemId5 {
    type: string;
    title: string;
    description: string;
}

export interface Id135 {
    type: string;
    title: string;
    description: string;
}

export interface Code9 {
    type: string;
    title: string;
    description: string;
}

export interface Amount15 {
    type: string;
    title: string;
    description: string;
}

export interface CartId4 {
    type: string;
    title: string;
    description: string;
}

export interface Description45 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId9 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt74 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt69 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseLineItemTaxLine {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties397;
}

export interface Properties397 {
    item: Item3;
    item_id: ItemId6;
    total: Total11;
    subtotal: Subtotal11;
    id: Id136;
    description: Description46;
    tax_rate_id: TaxRateId;
    code: Code10;
    rate: Rate5;
    provider_id: ProviderId10;
    created_at: CreatedAt75;
    updated_at: UpdatedAt70;
}

export interface Item3 {
    $ref: string;
}

export interface ItemId6 {
    type: string;
    title: string;
    description: string;
}

export interface Total11 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal11 {
    type: string;
    title: string;
    description: string;
}

export interface Id136 {
    type: string;
    title: string;
    description: string;
}

export interface Description46 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId {
    type: string;
    title: string;
    description: string;
}

export interface Code10 {
    type: string;
    title: string;
    description: string;
}

export interface Rate5 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId10 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt75 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt70 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseOrder {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties398;
}

export interface Properties398 {
    payment_collections: PaymentCollections4;
    fulfillments: Fulfillments4;
    shipping_address: ShippingAddress7;
    billing_address: BillingAddress7;
    id: Id137;
    version: Version7;
    region_id: RegionId7;
    customer_id: CustomerId8;
    sales_channel_id: SalesChannelId5;
    email: Email11;
    currency_code: CurrencyCode21;
    display_id: DisplayId7;
    items: Items354;
    shipping_methods: ShippingMethods7;
    payment_status: PaymentStatus4;
    fulfillment_status: FulfillmentStatus4;
    transactions: Transactions6;
    summary: Summary5;
    metadata: Metadata110;
    created_at: CreatedAt76;
    updated_at: UpdatedAt71;
    original_item_total: OriginalItemTotal5;
    original_item_subtotal: OriginalItemSubtotal5;
    original_item_tax_total: OriginalItemTaxTotal5;
    item_total: ItemTotal8;
    item_subtotal: ItemSubtotal8;
    item_tax_total: ItemTaxTotal8;
    original_total: OriginalTotal11;
    original_subtotal: OriginalSubtotal11;
    original_tax_total: OriginalTaxTotal11;
    total: Total12;
    subtotal: Subtotal12;
    tax_total: TaxTotal11;
    discount_total: DiscountTotal11;
    discount_tax_total: DiscountTaxTotal11;
    gift_card_total: GiftCardTotal5;
    gift_card_tax_total: GiftCardTaxTotal5;
    shipping_total: ShippingTotal5;
    shipping_subtotal: ShippingSubtotal5;
    shipping_tax_total: ShippingTaxTotal5;
    original_shipping_total: OriginalShippingTotal5;
    original_shipping_subtotal: OriginalShippingSubtotal5;
    original_shipping_tax_total: OriginalShippingTaxTotal5;
    status: Status18;
}

export interface PaymentCollections4 {
    type: string;
    description: string;
    items: Items352;
}

export interface Items352 {
    $ref: string;
}

export interface Fulfillments4 {
    type: string;
    description: string;
    items: Items353;
}

export interface Items353 {
    $ref: string;
}

export interface ShippingAddress7 {
    $ref: string;
}

export interface BillingAddress7 {
    $ref: string;
}

export interface Id137 {
    type: string;
    title: string;
    description: string;
}

export interface Version7 {
    type: string;
    title: string;
    description: string;
}

export interface RegionId7 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId8 {
    type: string;
    title: string;
    description: string;
}

export interface SalesChannelId5 {
    type: string;
    title: string;
    description: string;
}

export interface Email11 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CurrencyCode21 {
    type: string;
    title: string;
    description: string;
}

export interface DisplayId7 {
    type: string;
    title: string;
    description: string;
}

export interface Items354 {
    type: string;
    description: string;
    items: Items355;
}

export interface Items355 {
    $ref: string;
}

export interface ShippingMethods7 {
    type: string;
    description: string;
    items: Items356;
}

export interface Items356 {
    $ref: string;
}

export interface PaymentStatus4 {
    type: string;
    description: string;
    enum: string[];
}

export interface FulfillmentStatus4 {
    type: string;
    description: string;
    enum: string[];
}

export interface Transactions6 {
    type: string;
    description: string;
    items: Items357;
}

export interface Items357 {
    $ref: string;
}

export interface Summary5 {
    $ref: string;
}

export interface Metadata110 {
    type: string;
    description: string;
}

export interface CreatedAt76 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt71 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalItemTotal5 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemSubtotal5 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemTaxTotal5 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal8 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTotal11 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal11 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal11 {
    type: string;
    title: string;
    description: string;
}

export interface Total12 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal12 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal11 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal11 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal11 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTotal5 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTaxTotal5 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTotal5 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingSubtotal5 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTaxTotal5 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTotal5 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingSubtotal5 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTaxTotal5 {
    type: string;
    title: string;
    description: string;
}

export interface Status18 {
    type: string;
    title: string;
    description: string;
}

export interface BaseOrderAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties399;
}

export interface Properties399 {
    id: Id138;
    customer_id: CustomerId9;
    first_name: FirstName15;
    last_name: LastName15;
    phone: Phone15;
    company: Company14;
    address_1: Address114;
    address_2: Address214;
    city: City15;
    country_code: CountryCode17;
    province: Province14;
    postal_code: PostalCode14;
    metadata: Metadata111;
    created_at: CreatedAt77;
    updated_at: UpdatedAt72;
}

export interface Id138 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId9 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName15 {
    type: string;
    title: string;
    description: string;
}

export interface LastName15 {
    type: string;
    title: string;
    description: string;
}

export interface Phone15 {
    type: string;
    title: string;
    description: string;
}

export interface Company14 {
    type: string;
    title: string;
    description: string;
}

export interface Address114 {
    type: string;
    title: string;
    description: string;
}

export interface Address214 {
    type: string;
    title: string;
    description: string;
}

export interface City15 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode17 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Province14 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode14 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata111 {
    type: string;
    description: string;
}

export interface CreatedAt77 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt72 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseOrderFulfillment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties400;
}

export interface Properties400 {
    id: Id139;
    location_id: LocationId14;
    packed_at: PackedAt4;
    shipped_at: ShippedAt4;
    delivered_at: DeliveredAt4;
    canceled_at: CanceledAt9;
    data: Data14;
    provider_id: ProviderId11;
    shipping_option_id: ShippingOptionId13;
    metadata: Metadata112;
    created_at: CreatedAt78;
    updated_at: UpdatedAt73;
    requires_shipping: RequiresShipping7;
}

export interface Id139 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId14 {
    type: string;
    title: string;
    description: string;
}

export interface PackedAt4 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface ShippedAt4 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DeliveredAt4 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CanceledAt9 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface Data14 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs100 {
    url: string;
}

export interface ProviderId11 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId13 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata112 {
    type: string;
    description: string;
}

export interface CreatedAt78 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt73 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface RequiresShipping7 {
    type: string;
    title: string;
    description: string;
}

export interface BaseOrderItemDetail {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties401;
}

export interface Properties401 {
    id: Id140;
    item_id: ItemId7;
    item: Item4;
    quantity: Quantity26;
    fulfilled_quantity: FulfilledQuantity;
    delivered_quantity: DeliveredQuantity;
    shipped_quantity: ShippedQuantity;
    return_requested_quantity: ReturnRequestedQuantity;
    return_received_quantity: ReturnReceivedQuantity;
    return_dismissed_quantity: ReturnDismissedQuantity;
    written_off_quantity: WrittenOffQuantity;
    metadata: Metadata113;
    created_at: CreatedAt79;
    updated_at: UpdatedAt74;
}

export interface Id140 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId7 {
    type: string;
    title: string;
    description: string;
}

export interface Item4 {
    type: string;
}

export interface Quantity26 {
    type: string;
    title: string;
    description: string;
}

export interface FulfilledQuantity {
    type: string;
    title: string;
    description: string;
}

export interface DeliveredQuantity {
    type: string;
    title: string;
    description: string;
}

export interface ShippedQuantity {
    type: string;
    title: string;
    description: string;
}

export interface ReturnRequestedQuantity {
    type: string;
    title: string;
    description: string;
}

export interface ReturnReceivedQuantity {
    type: string;
    title: string;
    description: string;
}

export interface ReturnDismissedQuantity {
    type: string;
    title: string;
    description: string;
}

export interface WrittenOffQuantity {
    type: string;
    title: string;
    description: string;
}

export interface Metadata113 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt79 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt74 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseOrderLineItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties402;
}

export interface Properties402 {
    id: Id141;
    title: Title33;
    subtitle: Subtitle8;
    thumbnail: Thumbnail10;
    variant: Variant6;
    variant_id: VariantId14;
    product: Product8;
    product_id: ProductId6;
    product_title: ProductTitle4;
    product_description: ProductDescription4;
    product_subtitle: ProductSubtitle4;
    product_type: ProductType5;
    product_collection: ProductCollection4;
    product_handle: ProductHandle4;
    variant_sku: VariantSku4;
    variant_barcode: VariantBarcode4;
    variant_title: VariantTitle4;
    variant_option_values: VariantOptionValues4;
    requires_shipping: RequiresShipping8;
    is_discountable: IsDiscountable4;
    is_tax_inclusive: IsTaxInclusive12;
    compare_at_unit_price: CompareAtUnitPrice7;
    unit_price: UnitPrice9;
    quantity: Quantity27;
    tax_lines: TaxLines7;
    adjustments: Adjustments7;
    detail: Detail4;
    created_at: CreatedAt80;
    updated_at: UpdatedAt75;
    metadata: Metadata114;
    original_total: OriginalTotal12;
    original_subtotal: OriginalSubtotal12;
    original_tax_total: OriginalTaxTotal12;
    item_total: ItemTotal9;
    item_subtotal: ItemSubtotal9;
    item_tax_total: ItemTaxTotal9;
    total: Total13;
    subtotal: Subtotal13;
    tax_total: TaxTotal12;
    discount_total: DiscountTotal12;
    discount_tax_total: DiscountTaxTotal12;
    refundable_total: RefundableTotal3;
    refundable_total_per_unit: RefundableTotalPerUnit3;
    product_type_id: ProductTypeId2;
}

export interface Id141 {
    type: string;
    title: string;
    description: string;
}

export interface Title33 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle8 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail10 {
    type: string;
    title: string;
    description: string;
}

export interface Variant6 {
    $ref: string;
}

export interface VariantId14 {
    type: string;
    title: string;
    description: string;
}

export interface Product8 {
    $ref: string;
}

export interface ProductId6 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTitle4 {
    type: string;
    title: string;
    description: string;
}

export interface ProductDescription4 {
    type: string;
    title: string;
    description: string;
}

export interface ProductSubtitle4 {
    type: string;
    title: string;
    description: string;
}

export interface ProductType5 {
    type: string;
    title: string;
    description: string;
}

export interface ProductCollection4 {
    type: string;
    title: string;
    description: string;
}

export interface ProductHandle4 {
    type: string;
    title: string;
    description: string;
}

export interface VariantSku4 {
    type: string;
    title: string;
    description: string;
}

export interface VariantBarcode4 {
    type: string;
    title: string;
    description: string;
}

export interface VariantTitle4 {
    type: string;
    title: string;
    description: string;
}

export interface VariantOptionValues4 {
    type: string;
    description: string;
    example: Example11;
}

export interface Example11 {
    Color: string;
}

export interface RequiresShipping8 {
    type: string;
    title: string;
    description: string;
}

export interface IsDiscountable4 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive12 {
    type: string;
    title: string;
    description: string;
}

export interface CompareAtUnitPrice7 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice9 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity27 {
    type: string;
    title: string;
    description: string;
}

export interface TaxLines7 {
    type: string;
    description: string;
    items: Items358;
}

export interface Items358 {
    $ref: string;
}

export interface Adjustments7 {
    type: string;
    description: string;
    items: Items359;
}

export interface Items359 {
    $ref: string;
}

export interface Detail4 {
    $ref: string;
}

export interface CreatedAt80 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt75 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata114 {
    type: string;
    description: string;
}

export interface OriginalTotal12 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal12 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal12 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal9 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal9 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal9 {
    type: string;
    title: string;
    description: string;
}

export interface Total13 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal13 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal12 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal12 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal12 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotal3 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotalPerUnit3 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTypeId2 {
    type: string;
    title: string;
    description: string;
}

export interface BaseOrderLineItemAdjustment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties403;
    "required": string[];
}

export interface Properties403 {
    item: Item5;
    item_id: ItemId8;
    id: Id142;
    code: Code11;
    amount: Amount16;
    order_id: OrderId16;
    description: Description47;
    promotion_id: PromotionId2;
    provider_id: ProviderId12;
    created_at: CreatedAt81;
    updated_at: UpdatedAt76;
}

export interface Item5 {
    type: string;
}

export interface ItemId8 {
    type: string;
    title: string;
    description: string;
}

export interface Id142 {
    type: string;
    title: string;
    description: string;
}

export interface Code11 {
    type: string;
    title: string;
    description: string;
}

export interface Amount16 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId16 {
    type: string;
    title: string;
    description: string;
}

export interface Description47 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId2 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId12 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt81 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt76 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseOrderLineItemTaxLine {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties404;
    "required": string[];
}

export interface Properties404 {
    item: Item6;
    item_id: ItemId9;
    total: Total14;
    subtotal: Subtotal14;
    id: Id143;
    description: Description48;
    tax_rate_id: TaxRateId2;
    code: Code12;
    rate: Rate6;
    provider_id: ProviderId13;
    created_at: CreatedAt82;
    updated_at: UpdatedAt77;
}

export interface Item6 {
    type: string;
}

export interface ItemId9 {
    type: string;
    title: string;
    description: string;
}

export interface Total14 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal14 {
    type: string;
    title: string;
    description: string;
}

export interface Id143 {
    type: string;
    title: string;
    description: string;
}

export interface Description48 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId2 {
    type: string;
    title: string;
    description: string;
}

export interface Code12 {
    type: string;
    title: string;
    description: string;
}

export interface Rate6 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId13 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt82 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt77 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseOrderShippingDetail {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties405;
}

export interface Properties405 {
    id: Id144;
    shipping_method_id: ShippingMethodId;
    shipping_method: ShippingMethod;
    claim_id: ClaimId5;
    exchange_id: ExchangeId5;
    return_id: ReturnId6;
    created_at: CreatedAt83;
    updated_at: UpdatedAt78;
}

export interface Id144 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethodId {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethod {
    type: string;
}

export interface ClaimId5 {
    type: string;
    title: string;
    description: string;
}

export interface ExchangeId5 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId6 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt83 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt78 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseOrderShippingMethod {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties406;
}

export interface Properties406 {
    id: Id145;
    order_id: OrderId17;
    name: Name33;
    description: Description49;
    amount: Amount17;
    is_tax_inclusive: IsTaxInclusive13;
    shipping_option_id: ShippingOptionId14;
    data: Data15;
    metadata: Metadata115;
    tax_lines: TaxLines8;
    adjustments: Adjustments8;
    original_total: OriginalTotal13;
    original_subtotal: OriginalSubtotal13;
    original_tax_total: OriginalTaxTotal13;
    total: Total15;
    subtotal: Subtotal15;
    tax_total: TaxTotal13;
    discount_total: DiscountTotal13;
    discount_tax_total: DiscountTaxTotal13;
    created_at: CreatedAt84;
    updated_at: UpdatedAt79;
    detail: Detail5;
}

export interface Id145 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId17 {
    type: string;
    title: string;
    description: string;
}

export interface Name33 {
    type: string;
    title: string;
    description: string;
}

export interface Description49 {
    type: string;
    title: string;
    description: string;
}

export interface Amount17 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive13 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId14 {
    type: string;
    title: string;
    description: string;
}

export interface Data15 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs101 {
    url: string;
}

export interface Metadata115 {
    type: string;
    description: string;
}

export interface TaxLines8 {
    type: string;
    description: string;
    items: Items360;
}

export interface Items360 {
    $ref: string;
}

export interface Adjustments8 {
    type: string;
    description: string;
    items: Items361;
}

export interface Items361 {
    $ref: string;
}

export interface OriginalTotal13 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal13 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal13 {
    type: string;
    title: string;
    description: string;
}

export interface Total15 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal15 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal13 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal13 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal13 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt84 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt79 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Detail5 {
    $ref: string;
}

export interface BaseOrderShippingMethodAdjustment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties407;
    "required": string[];
}

export interface Properties407 {
    shipping_method: ShippingMethod2;
    shipping_method_id: ShippingMethodId2;
    id: Id146;
    code: Code13;
    amount: Amount18;
    order_id: OrderId18;
    description: Description50;
    promotion_id: PromotionId3;
    provider_id: ProviderId14;
    created_at: CreatedAt85;
    updated_at: UpdatedAt80;
}

export interface ShippingMethod2 {
    type: string;
}

export interface ShippingMethodId2 {
    type: string;
    title: string;
    description: string;
}

export interface Id146 {
    type: string;
    title: string;
    description: string;
}

export interface Code13 {
    type: string;
    title: string;
    description: string;
}

export interface Amount18 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId18 {
    type: string;
    title: string;
    description: string;
}

export interface Description50 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId3 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId14 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt85 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt80 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseOrderShippingMethodTaxLine {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties408;
    "required": string[];
}

export interface Properties408 {
    shipping_method: ShippingMethod3;
    shipping_method_id: ShippingMethodId3;
    total: Total16;
    subtotal: Subtotal16;
    id: Id147;
    description: Description51;
    tax_rate_id: TaxRateId3;
    code: Code14;
    rate: Rate7;
    provider_id: ProviderId15;
    created_at: CreatedAt86;
    updated_at: UpdatedAt81;
}

export interface ShippingMethod3 {
    type: string;
}

export interface ShippingMethodId3 {
    type: string;
    title: string;
    description: string;
}

export interface Total16 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal16 {
    type: string;
    title: string;
    description: string;
}

export interface Id147 {
    type: string;
    title: string;
    description: string;
}

export interface Description51 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId3 {
    type: string;
    title: string;
    description: string;
}

export interface Code14 {
    type: string;
    title: string;
    description: string;
}

export interface Rate7 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId15 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt86 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt81 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseOrderSummary {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties409;
}

export interface Properties409 {
    paid_total: PaidTotal;
    refunded_total: RefundedTotal;
    pending_difference: PendingDifference;
    current_order_total: CurrentOrderTotal;
    original_order_total: OriginalOrderTotal;
    transaction_total: TransactionTotal;
    accounting_total: AccountingTotal;
}

export interface PaidTotal {
    type: string;
    title: string;
    description: string;
}

export interface RefundedTotal {
    type: string;
    title: string;
    description: string;
}

export interface PendingDifference {
    type: string;
    title: string;
    description: string;
}

export interface CurrentOrderTotal {
    type: string;
    title: string;
    description: string;
}

export interface OriginalOrderTotal {
    type: string;
    title: string;
    description: string;
}

export interface TransactionTotal {
    type: string;
    title: string;
    description: string;
}

export interface AccountingTotal {
    type: string;
    title: string;
    description: string;
}

export interface BaseOrderTransaction {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties410;
}

export interface Properties410 {
    id: Id148;
    order_id: OrderId19;
    amount: Amount19;
    currency_code: CurrencyCode22;
    reference: Reference5;
    reference_id: ReferenceId5;
    metadata: Metadata116;
    created_at: CreatedAt87;
    updated_at: UpdatedAt82;
}

export interface Id148 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId19 {
    type: string;
    title: string;
    description: string;
}

export interface Amount19 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode22 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Reference5 {
    type: string;
    title: string;
    description: string;
    enum: string[];
}

export interface ReferenceId5 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata116 {
    type: string;
    description: string;
}

export interface CreatedAt87 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt82 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BasePayment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties411;
}

export interface Properties411 {
    id: Id149;
    amount: Amount20;
    authorized_amount: AuthorizedAmount3;
    currency_code: CurrencyCode23;
    provider_id: ProviderId16;
    data: Data16;
    created_at: CreatedAt88;
    updated_at: UpdatedAt83;
    captured_at: CapturedAt2;
    canceled_at: CanceledAt10;
    captured_amount: CapturedAmount3;
    refunded_amount: RefundedAmount3;
    captures: Captures2;
    refunds: Refunds2;
    payment_collection: PaymentCollection5;
    payment_session: PaymentSession2;
}

export interface Id149 {
    type: string;
    title: string;
    description: string;
}

export interface Amount20 {
    type: string;
    title: string;
    description: string;
}

export interface AuthorizedAmount3 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode23 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId16 {
    type: string;
    title: string;
    description: string;
}

export interface Data16 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs102 {
    url: string;
}

export interface CreatedAt88 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt83 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CapturedAt2 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CanceledAt10 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CapturedAmount3 {
    type: string;
    title: string;
    description: string;
}

export interface RefundedAmount3 {
    type: string;
    title: string;
    description: string;
}

export interface Captures2 {
    type: string;
    description: string;
    items: Items362;
}

export interface Items362 {
    $ref: string;
}

export interface Refunds2 {
    type: string;
    description: string;
    items: Items363;
}

export interface Items363 {
    $ref: string;
}

export interface PaymentCollection5 {
    type: string;
}

export interface PaymentSession2 {
    type: string;
}

export interface BasePaymentCollection {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties412;
}

export interface Properties412 {
    id: Id150;
    currency_code: CurrencyCode24;
    amount: Amount21;
    authorized_amount: AuthorizedAmount4;
    captured_amount: CapturedAmount4;
    refunded_amount: RefundedAmount4;
    completed_at: CompletedAt2;
    created_at: CreatedAt89;
    updated_at: UpdatedAt84;
    metadata: Metadata117;
    status: Status19;
    payment_providers: PaymentProviders5;
    payment_sessions: PaymentSessions2;
    payments: Payments2;
}

export interface Id150 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode24 {
    type: string;
    title: string;
    description: string;
}

export interface Amount21 {
    type: string;
    title: string;
    description: string;
}

export interface AuthorizedAmount4 {
    type: string;
    title: string;
    description: string;
}

export interface CapturedAmount4 {
    type: string;
    title: string;
    description: string;
}

export interface RefundedAmount4 {
    type: string;
    title: string;
    description: string;
}

export interface CompletedAt2 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedAt89 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt84 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata117 {
    type: string;
    description: string;
}

export interface Status19 {
    type: string;
    description: string;
    enum: string[];
}

export interface PaymentProviders5 {
    type: string;
    description: string;
    items: Items364;
}

export interface Items364 {
    $ref: string;
}

export interface PaymentSessions2 {
    type: string;
    description: string;
    items: Items365;
}

export interface Items365 {
    $ref: string;
}

export interface Payments2 {
    type: string;
    description: string;
    items: Items366;
}

export interface Items366 {
    $ref: string;
}

export interface BasePaymentProvider {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties413;
}

export interface Properties413 {
    id: Id151;
}

export interface Id151 {
    type: string;
    title: string;
    description: string;
}

export interface BasePaymentSession {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties414;
}

export interface Properties414 {
    id: Id152;
    amount: Amount22;
    currency_code: CurrencyCode25;
    provider_id: ProviderId17;
    data: Data17;
    context: Context3;
    status: Status20;
    authorized_at: AuthorizedAt2;
    payment_collection: PaymentCollection6;
    payment: Payment5;
}

export interface Id152 {
    type: string;
    title: string;
    description: string;
}

export interface Amount22 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode25 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ProviderId17 {
    type: string;
    title: string;
    description: string;
}

export interface Data17 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs103 {
    url: string;
}

export interface Context3 {
    type: string;
    description: string;
    example: Example12;
}

export interface Example12 {
    customer: Customer6;
}

export interface Customer6 {
    id: string;
}

export interface Status20 {
    type: string;
    description: string;
    enum: string[];
}

export interface AuthorizedAt2 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface PaymentCollection6 {
    type: string;
}

export interface Payment5 {
    $ref: string;
}

export interface BaseProduct {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties415;
}

export interface Properties415 {
    collection: Collection3;
    categories: Categories5;
    variants: Variants5;
    type: Type21;
    tags: Tags5;
    length: Length11;
    title: Title34;
    status: Status21;
    options: Options10;
    description: Description52;
    id: Id153;
    metadata: Metadata118;
    created_at: CreatedAt90;
    updated_at: UpdatedAt85;
    handle: Handle11;
    subtitle: Subtitle9;
    is_giftcard: IsGiftcard5;
    thumbnail: Thumbnail11;
    width: Width11;
    weight: Weight11;
    height: Height11;
    origin_country: OriginCountry11;
    hs_code: HsCode11;
    mid_code: MidCode11;
    material: Material11;
    collection_id: CollectionId5;
    type_id: TypeId5;
    images: Images5;
    discountable: Discountable5;
    external_id: ExternalId7;
    deleted_at: DeletedAt45;
}

export interface Collection3 {
    $ref: string;
}

export interface Categories5 {
    type: string;
    description: string;
    items: Items367;
}

export interface Items367 {
    $ref: string;
}

export interface Variants5 {
    type: string;
    description: string;
    items: Items368;
}

export interface Items368 {
    type: string;
}

export interface Type21 {
    $ref: string;
}

export interface Tags5 {
    type: string;
    description: string;
    items: Items369;
}

export interface Items369 {
    $ref: string;
}

export interface Length11 {
    type: string;
    title: string;
    description: string;
}

export interface Title34 {
    type: string;
    title: string;
    description: string;
}

export interface Status21 {
    type: string;
    description: string;
    enum: string[];
}

export interface Options10 {
    type: string;
    description: string;
    items: Items370;
}

export interface Items370 {
    $ref: string;
}

export interface Description52 {
    type: string;
    title: string;
    description: string;
}

export interface Id153 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata118 {
    type: string;
    description: string;
}

export interface CreatedAt90 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt85 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Handle11 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle9 {
    type: string;
    title: string;
    description: string;
}

export interface IsGiftcard5 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail11 {
    type: string;
    title: string;
    description: string;
}

export interface Width11 {
    type: string;
    title: string;
    description: string;
}

export interface Weight11 {
    type: string;
    title: string;
    description: string;
}

export interface Height11 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry11 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode11 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode11 {
    type: string;
    title: string;
    description: string;
}

export interface Material11 {
    type: string;
    title: string;
    description: string;
}

export interface CollectionId5 {
    type: string;
    title: string;
    description: string;
}

export interface TypeId5 {
    type: string;
    title: string;
    description: string;
}

export interface Images5 {
    type: string;
    description: string;
    items: Items371;
}

export interface Items371 {
    $ref: string;
}

export interface Discountable5 {
    type: string;
    title: string;
    description: string;
}

export interface ExternalId7 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt45 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseProductCategory {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties416;
}

export interface Properties416 {
    category_children: CategoryChildren2;
    parent_category: ParentCategory2;
    products: Products5;
    name: Name34;
    description: Description53;
    id: Id154;
    metadata: Metadata119;
    created_at: CreatedAt91;
    updated_at: UpdatedAt86;
    handle: Handle12;
    deleted_at: DeletedAt46;
    is_active: IsActive3;
    is_internal: IsInternal3;
    rank: Rank4;
    parent_category_id: ParentCategoryId3;
}

export interface CategoryChildren2 {
    type: string;
    description: string;
    items: Items372;
}

export interface Items372 {
    $ref: string;
}

export interface ParentCategory2 {
    $ref: string;
}

export interface Products5 {
    type: string;
    description: string;
    items: Items373;
}

export interface Items373 {
    type: string;
}

export interface Name34 {
    type: string;
    title: string;
    description: string;
}

export interface Description53 {
    type: string;
    title: string;
    description: string;
}

export interface Id154 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata119 {
    type: string;
    description: string;
}

export interface CreatedAt91 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt86 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Handle12 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt46 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface IsActive3 {
    type: string;
    title: string;
    description: string;
}

export interface IsInternal3 {
    type: string;
    title: string;
    description: string;
}

export interface Rank4 {
    type: string;
    title: string;
    description: string;
}

export interface ParentCategoryId3 {
    type: string;
    title: string;
    description: string;
}

export interface BaseProductImage {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties417;
    "required": string[];
}

export interface Properties417 {
    id: Id155;
    url: Url6;
    created_at: CreatedAt92;
    updated_at: UpdatedAt87;
    deleted_at: DeletedAt47;
    metadata: Metadata120;
    rank: Rank5;
}

export interface Id155 {
    type: string;
    title: string;
    description: string;
}

export interface Url6 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt92 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt87 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt47 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata120 {
    type: string;
    description: string;
}

export interface Rank5 {
    type: string;
    title: string;
    description: string;
}

export interface BaseProductOption {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties418;
}

export interface Properties418 {
    id: Id156;
    title: Title35;
    product: Product9;
    product_id: ProductId7;
    values: Values7;
    metadata: Metadata121;
    created_at: CreatedAt93;
    updated_at: UpdatedAt88;
    deleted_at: DeletedAt48;
}

export interface Id156 {
    type: string;
    title: string;
    description: string;
}

export interface Title35 {
    type: string;
    title: string;
    description: string;
}

export interface Product9 {
    type: string;
}

export interface ProductId7 {
    type: string;
    title: string;
    description: string;
}

export interface Values7 {
    type: string;
    description: string;
    items: Items374;
}

export interface Items374 {
    $ref: string;
}

export interface Metadata121 {
    type: string;
    description: string;
}

export interface CreatedAt93 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt88 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt48 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseProductOptionValue {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties419;
}

export interface Properties419 {
    id: Id157;
    value: Value21;
    option: Option2;
    option_id: OptionId4;
    metadata: Metadata122;
    created_at: CreatedAt94;
    updated_at: UpdatedAt89;
    deleted_at: DeletedAt49;
}

export interface Id157 {
    type: string;
    title: string;
    description: string;
}

export interface Value21 {
    type: string;
    title: string;
    description: string;
}

export interface Option2 {
    type: string;
}

export interface OptionId4 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata122 {
    type: string;
    description: string;
}

export interface CreatedAt94 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt89 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt49 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseProductTag {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties420;
}

export interface Properties420 {
    id: Id158;
    value: Value22;
    created_at: CreatedAt95;
    updated_at: UpdatedAt90;
    deleted_at: DeletedAt50;
    metadata: Metadata123;
}

export interface Id158 {
    type: string;
    title: string;
    description: string;
}

export interface Value22 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt95 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt90 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt50 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata123 {
    type: string;
    description: string;
}

export interface BaseProductType {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties421;
}

export interface Properties421 {
    id: Id159;
    value: Value23;
    created_at: CreatedAt96;
    updated_at: UpdatedAt91;
    deleted_at: DeletedAt51;
    metadata: Metadata124;
}

export interface Id159 {
    type: string;
    title: string;
    description: string;
}

export interface Value23 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt96 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt91 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt51 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata124 {
    type: string;
    description: string;
}

export interface BaseProductVariant {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties422;
}

export interface Properties422 {
    id: Id160;
    title: Title36;
    sku: Sku9;
    barcode: Barcode7;
    ean: Ean5;
    upc: Upc5;
    allow_backorder: AllowBackorder8;
    manage_inventory: ManageInventory5;
    inventory_quantity: InventoryQuantity2;
    hs_code: HsCode12;
    origin_country: OriginCountry12;
    mid_code: MidCode12;
    material: Material12;
    weight: Weight12;
    length: Length12;
    height: Height12;
    width: Width12;
    variant_rank: VariantRank5;
    options: Options11;
    product: Product10;
    product_id: ProductId8;
    calculated_price: CalculatedPrice3;
    created_at: CreatedAt97;
    updated_at: UpdatedAt92;
    deleted_at: DeletedAt52;
    metadata: Metadata125;
}

export interface Id160 {
    type: string;
    title: string;
    description: string;
}

export interface Title36 {
    type: string;
    title: string;
    description: string;
}

export interface Sku9 {
    type: string;
    title: string;
    description: string;
}

export interface Barcode7 {
    type: string;
    title: string;
    description: string;
}

export interface Ean5 {
    type: string;
    title: string;
    description: string;
}

export interface Upc5 {
    type: string;
    title: string;
    description: string;
}

export interface AllowBackorder8 {
    type: string;
    title: string;
    description: string;
}

export interface ManageInventory5 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode12 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry12 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode12 {
    type: string;
    title: string;
    description: string;
}

export interface Material12 {
    type: string;
    title: string;
    description: string;
}

export interface Weight12 {
    type: string;
    title: string;
    description: string;
}

export interface Length12 {
    type: string;
    title: string;
    description: string;
}

export interface Height12 {
    type: string;
    title: string;
    description: string;
}

export interface Width12 {
    type: string;
    title: string;
    description: string;
}

export interface VariantRank5 {
    type: string;
    title: string;
    description: string;
}

export interface Options11 {
    type: string;
    description: string;
    items: Items375;
}

export interface Items375 {
    $ref: string;
}

export interface Product10 {
    $ref: string;
}

export interface ProductId8 {
    type: string;
    title: string;
    description: string;
}

export interface CalculatedPrice3 {
    $ref: string;
}

export interface CreatedAt97 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt92 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt52 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata125 {
    type: string;
    description: string;
}

export interface BasePromotionRuleValue {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties423;
}

export interface Properties423 {
    id: Id161;
    value: Value24;
}

export interface Id161 {
    type: string;
    title: string;
    description: string;
}

export interface Value24 {
    type: string;
    title: string;
    description: string;
}

export interface BaseRefund {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties424;
}

export interface Properties424 {
    id: Id162;
    amount: Amount23;
    refund_reason_id: RefundReasonId2;
    note: Note3;
    created_at: CreatedAt98;
    created_by: CreatedBy12;
    payment: Payment6;
    refund_reason: RefundReason2;
}

export interface Id162 {
    type: string;
    title: string;
    description: string;
}

export interface Amount23 {
    type: string;
    title: string;
    description: string;
}

export interface RefundReasonId2 {
    type: string;
    title: string;
    description: string;
}

export interface Note3 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt98 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedBy12 {
    type: string;
    title: string;
    description: string;
}

export interface Payment6 {
    type: string;
}

export interface RefundReason2 {
    $ref: string;
}

export interface BaseRegion {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties425;
}

export interface Properties425 {
    id: Id163;
    name: Name35;
    currency_code: CurrencyCode26;
    automatic_taxes: AutomaticTaxes3;
    countries: Countries3;
    payment_providers: PaymentProviders6;
    metadata: Metadata126;
    created_at: CreatedAt99;
    updated_at: UpdatedAt93;
}

export interface Id163 {
    type: string;
    title: string;
    description: string;
}

export interface Name35 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode26 {
    type: string;
    title: string;
    description: string;
}

export interface AutomaticTaxes3 {
    type: string;
    title: string;
    description: string;
}

export interface Countries3 {
    type: string;
    description: string;
    items: Items376;
}

export interface Items376 {
    $ref: string;
}

export interface PaymentProviders6 {
    type: string;
    description: string;
    items: Items377;
}

export interface Items377 {
    $ref: string;
}

export interface Metadata126 {
    type: string;
    description: string;
}

export interface CreatedAt99 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt93 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseRegionCountry {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties426;
    "required": string[];
}

export interface Properties426 {
    id: Id164;
    iso_2: Iso22;
    iso_3: Iso32;
    num_code: NumCode2;
    name: Name36;
    display_name: DisplayName2;
}

export interface Id164 {
    type: string;
    title: string;
    description: string;
}

export interface Iso22 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Iso32 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface NumCode2 {
    type: string;
    title: string;
    description: string;
    example: number;
}

export interface Name36 {
    type: string;
    title: string;
    description: string;
}

export interface DisplayName2 {
    type: string;
    title: string;
    description: string;
}

export interface BaseRuleOperatorOptions {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties427;
}

export interface Properties427 {
    id: Id165;
    value: Value25;
    label: Label10;
}

export interface Id165 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Value25 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Label10 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface BaseShippingMethodAdjustment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties428;
}

export interface Properties428 {
    shipping_method: ShippingMethod4;
    shipping_method_id: ShippingMethodId4;
    id: Id166;
    code: Code15;
    amount: Amount24;
    cart_id: CartId5;
    description: Description54;
    promotion_id: PromotionId4;
    provider_id: ProviderId18;
    created_at: CreatedAt100;
    updated_at: UpdatedAt94;
}

export interface ShippingMethod4 {
    type: string;
}

export interface ShippingMethodId4 {
    type: string;
    title: string;
    description: string;
}

export interface Id166 {
    type: string;
    title: string;
    description: string;
}

export interface Code15 {
    type: string;
    title: string;
    description: string;
}

export interface Amount24 {
    type: string;
    title: string;
    description: string;
}

export interface CartId5 {
    type: string;
    title: string;
    description: string;
}

export interface Description54 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId4 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId18 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt100 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt94 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface BaseShippingMethodTaxLine {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties429;
}

export interface Properties429 {
    shipping_method: ShippingMethod5;
    shipping_method_id: ShippingMethodId5;
    total: Total17;
    subtotal: Subtotal17;
    id: Id167;
    description: Description55;
    tax_rate_id: TaxRateId4;
    code: Code16;
    rate: Rate8;
    provider_id: ProviderId19;
    created_at: CreatedAt101;
    updated_at: UpdatedAt95;
}

export interface ShippingMethod5 {
    type: string;
}

export interface ShippingMethodId5 {
    type: string;
    title: string;
    description: string;
}

export interface Total17 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal17 {
    type: string;
    title: string;
    description: string;
}

export interface Id167 {
    type: string;
    title: string;
    description: string;
}

export interface Description55 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId4 {
    type: string;
    title: string;
    description: string;
}

export interface Code16 {
    type: string;
    title: string;
    description: string;
}

export interface Rate8 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId19 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt101 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt95 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CampaignResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties430;
}

export interface Properties430 {
    id: Id168;
    name: Name37;
    description: Description56;
    currency: Currency4;
    campaign_identifier: CampaignIdentifier2;
    starts_at: StartsAt5;
    ends_at: EndsAt5;
    budget: Budget2;
}

export interface Id168 {
    type: string;
    title: string;
    description: string;
}

export interface Name37 {
    type: string;
    title: string;
    description: string;
}

export interface Description56 {
    type: string;
    title: string;
    description: string;
}

export interface Currency4 {
    type: string;
    title: string;
    description: string;
}

export interface CampaignIdentifier2 {
    type: string;
    title: string;
    description: string;
}

export interface StartsAt5 {
    type: string;
    title: string;
    description: string;
}

export interface EndsAt5 {
    type: string;
    title: string;
    description: string;
}

export interface Budget2 {
    type: string;
    description: string;
    required: string[];
    properties: Properties431;
}

export interface Properties431 {
    id: Id169;
    type: Type22;
    currency_code: CurrencyCode27;
    limit: Limit24;
    used: Used2;
}

export interface Id169 {
    type: string;
    title: string;
    description: string;
}

export interface Type22 {
    type: string;
    enum: string[];
}

export interface CurrencyCode27 {
    type: string;
    title: string;
    description: string;
}

export interface Limit24 {
    type: string;
    title: string;
    description: string;
}

export interface Used2 {
    type: string;
    title: string;
    description: string;
}

export interface CreateAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties432;
}

export interface Properties432 {
    customer_id: CustomerId10;
    company: Company15;
    first_name: FirstName16;
    last_name: LastName16;
    address_1: Address115;
    address_2: Address215;
    city: City16;
    country_code: CountryCode18;
    province: Province15;
    postal_code: PostalCode15;
    phone: Phone16;
    metadata: Metadata127;
}

export interface CustomerId10 {
    type: string;
    title: string;
    description: string;
}

export interface Company15 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName16 {
    type: string;
    title: string;
    description: string;
}

export interface LastName16 {
    type: string;
    title: string;
    description: string;
}

export interface Address115 {
    type: string;
    title: string;
    description: string;
}

export interface Address215 {
    type: string;
    title: string;
    description: string;
}

export interface City16 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode18 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Province15 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode15 {
    type: string;
    title: string;
    description: string;
}

export interface Phone16 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata127 {
    type: string;
    description: string;
}

export interface CustomerGroupInCustomerFilters {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties433;
}

export interface Properties433 {
    id: Id170;
    name: Name38;
    created_at: CreatedAt102;
    updated_at: UpdatedAt96;
    deleted_at: DeletedAt53;
}

export interface Id170 {
    oneOf: OneOf68[];
}

export interface OneOf68 {
    type: string;
    title?: string;
    description: string;
    items?: Items378;
}

export interface Items378 {
    type: string;
    title: string;
    description: string;
}

export interface Name38 {
    oneOf: OneOf69[];
}

export interface OneOf69 {
    type: string;
    title?: string;
    description: string;
    items?: Items379;
}

export interface Items379 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt102 {
    type: string;
    description: string;
    properties: Properties434;
}

export interface Properties434 {
    $and: And15;
    $or: Or15;
    $eq: Eq15;
    $ne: Ne15;
    $in: In15;
    $nin: Nin15;
    $not: Not15;
    $gt: Gt15;
    $gte: Gte15;
    $lt: Lt15;
    $lte: Lte15;
    $like: Like15;
    $re: Re15;
    $ilike: Ilike15;
    $fulltext: Fulltext15;
    $overlap: Overlap15;
    $contains: Contains15;
    $contained: Contained15;
    $exists: Exists15;
}

export interface And15 {
    type: string;
    description: string;
    items: Items380;
    title: string;
}

export interface Items380 {
    type: string;
}

export interface Or15 {
    type: string;
    description: string;
    items: Items381;
    title: string;
}

export interface Items381 {
    type: string;
}

export interface Eq15 {
    oneOf: OneOf70[];
}

export interface OneOf70 {
    type: string;
    title?: string;
    description: string;
    items?: Items382;
}

export interface Items382 {
    type: string;
    title: string;
    description: string;
}

export interface Ne15 {
    type: string;
    title: string;
    description: string;
}

export interface In15 {
    type: string;
    description: string;
    items: Items383;
}

export interface Items383 {
    type: string;
    title: string;
    description: string;
}

export interface Nin15 {
    type: string;
    description: string;
    items: Items384;
}

export interface Items384 {
    type: string;
    title: string;
    description: string;
}

export interface Not15 {
    oneOf: OneOf71[];
}

export interface OneOf71 {
    type: string;
    title?: string;
    description: string;
    items?: Items385;
}

export interface Items385 {
    type: string;
    title: string;
    description: string;
}

export interface Gt15 {
    type: string;
    title: string;
    description: string;
}

export interface Gte15 {
    type: string;
    title: string;
    description: string;
}

export interface Lt15 {
    type: string;
    title: string;
    description: string;
}

export interface Lte15 {
    type: string;
    title: string;
    description: string;
}

export interface Like15 {
    type: string;
    title: string;
    description: string;
}

export interface Re15 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike15 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext15 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap15 {
    type: string;
    description: string;
    items: Items386;
}

export interface Items386 {
    type: string;
    title: string;
    description: string;
}

export interface Contains15 {
    type: string;
    description: string;
    items: Items387;
}

export interface Items387 {
    type: string;
    title: string;
    description: string;
}

export interface Contained15 {
    type: string;
    description: string;
    items: Items388;
}

export interface Items388 {
    type: string;
    title: string;
    description: string;
}

export interface Exists15 {
    type: string;
    title: string;
    description: string;
}

export interface UpdatedAt96 {
    type: string;
    description: string;
    properties: Properties435;
}

export interface Properties435 {
    $and: And16;
    $or: Or16;
    $eq: Eq16;
    $ne: Ne16;
    $in: In16;
    $nin: Nin16;
    $not: Not16;
    $gt: Gt16;
    $gte: Gte16;
    $lt: Lt16;
    $lte: Lte16;
    $like: Like16;
    $re: Re16;
    $ilike: Ilike16;
    $fulltext: Fulltext16;
    $overlap: Overlap16;
    $contains: Contains16;
    $contained: Contained16;
    $exists: Exists16;
}

export interface And16 {
    type: string;
    description: string;
    items: Items389;
    title: string;
}

export interface Items389 {
    type: string;
}

export interface Or16 {
    type: string;
    description: string;
    items: Items390;
    title: string;
}

export interface Items390 {
    type: string;
}

export interface Eq16 {
    oneOf: OneOf72[];
}

export interface OneOf72 {
    type: string;
    title?: string;
    description: string;
    items?: Items391;
}

export interface Items391 {
    type: string;
    title: string;
    description: string;
}

export interface Ne16 {
    type: string;
    title: string;
    description: string;
}

export interface In16 {
    type: string;
    description: string;
    items: Items392;
}

export interface Items392 {
    type: string;
    title: string;
    description: string;
}

export interface Nin16 {
    type: string;
    description: string;
    items: Items393;
}

export interface Items393 {
    type: string;
    title: string;
    description: string;
}

export interface Not16 {
    oneOf: OneOf73[];
}

export interface OneOf73 {
    type: string;
    title?: string;
    description: string;
    items?: Items394;
}

export interface Items394 {
    type: string;
    title: string;
    description: string;
}

export interface Gt16 {
    type: string;
    title: string;
    description: string;
}

export interface Gte16 {
    type: string;
    title: string;
    description: string;
}

export interface Lt16 {
    type: string;
    title: string;
    description: string;
}

export interface Lte16 {
    type: string;
    title: string;
    description: string;
}

export interface Like16 {
    type: string;
    title: string;
    description: string;
}

export interface Re16 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike16 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext16 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap16 {
    type: string;
    description: string;
    items: Items395;
}

export interface Items395 {
    type: string;
    title: string;
    description: string;
}

export interface Contains16 {
    type: string;
    description: string;
    items: Items396;
}

export interface Items396 {
    type: string;
    title: string;
    description: string;
}

export interface Contained16 {
    type: string;
    description: string;
    items: Items397;
}

export interface Items397 {
    type: string;
    title: string;
    description: string;
}

export interface Exists16 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt53 {
    type: string;
    description: string;
    properties: Properties436;
}

export interface Properties436 {
    $and: And17;
    $or: Or17;
    $eq: Eq17;
    $ne: Ne17;
    $in: In17;
    $nin: Nin17;
    $not: Not17;
    $gt: Gt17;
    $gte: Gte17;
    $lt: Lt17;
    $lte: Lte17;
    $like: Like17;
    $re: Re17;
    $ilike: Ilike17;
    $fulltext: Fulltext17;
    $overlap: Overlap17;
    $contains: Contains17;
    $contained: Contained17;
    $exists: Exists17;
}

export interface And17 {
    type: string;
    description: string;
    items: Items398;
    title: string;
}

export interface Items398 {
    type: string;
}

export interface Or17 {
    type: string;
    description: string;
    items: Items399;
    title: string;
}

export interface Items399 {
    type: string;
}

export interface Eq17 {
    oneOf: OneOf74[];
}

export interface OneOf74 {
    type: string;
    title?: string;
    description: string;
    items?: Items400;
}

export interface Items400 {
    type: string;
    title: string;
    description: string;
}

export interface Ne17 {
    type: string;
    title: string;
    description: string;
}

export interface In17 {
    type: string;
    description: string;
    items: Items401;
}

export interface Items401 {
    type: string;
    title: string;
    description: string;
}

export interface Nin17 {
    type: string;
    description: string;
    items: Items402;
}

export interface Items402 {
    type: string;
    title: string;
    description: string;
}

export interface Not17 {
    oneOf: OneOf75[];
}

export interface OneOf75 {
    type: string;
    title?: string;
    description: string;
    items?: Items403;
}

export interface Items403 {
    type: string;
    title: string;
    description: string;
}

export interface Gt17 {
    type: string;
    title: string;
    description: string;
}

export interface Gte17 {
    type: string;
    title: string;
    description: string;
}

export interface Lt17 {
    type: string;
    title: string;
    description: string;
}

export interface Lte17 {
    type: string;
    title: string;
    description: string;
}

export interface Like17 {
    type: string;
    title: string;
    description: string;
}

export interface Re17 {
    type: string;
    title: string;
    description: string;
}

export interface Ilike17 {
    type: string;
    title: string;
    description: string;
}

export interface Fulltext17 {
    type: string;
    title: string;
    description: string;
}

export interface Overlap17 {
    type: string;
    description: string;
    items: Items404;
}

export interface Items404 {
    type: string;
    title: string;
    description: string;
}

export interface Contains17 {
    type: string;
    description: string;
    items: Items405;
}

export interface Items405 {
    type: string;
    title: string;
    description: string;
}

export interface Contained17 {
    type: string;
    description: string;
    items: Items406;
}

export interface Items406 {
    type: string;
    title: string;
    description: string;
}

export interface Exists17 {
    type: string;
    title: string;
    description: string;
}

export interface Error2 {
    title: string;
    type: string;
    properties: Properties437;
}

export interface Properties437 {
    code: Code17;
    message: Message2;
    type: Type23;
}

export interface Code17 {
    type: string;
    description: string;
    enum: string[];
}

export interface Message2 {
    type: string;
    description: string;
    example: string;
}

export interface Type23 {
    type: string;
    description: string;
    enum: string[];
}

export interface InventoryLevel {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties438;
}

export interface Properties438 {
    id: Id171;
    inventory_item_id: InventoryItemId15;
    location_id: LocationId15;
    stocked_quantity: StockedQuantity6;
    reserved_quantity: ReservedQuantity2;
    available_quantity: AvailableQuantity2;
    incoming_quantity: IncomingQuantity6;
    metadata: Metadata128;
}

export interface Id171 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryItemId15 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId15 {
    type: string;
    title: string;
    description: string;
}

export interface StockedQuantity6 {
    type: string;
    title: string;
    description: string;
}

export interface ReservedQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface AvailableQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface IncomingQuantity6 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata128 {
    type: string;
    description: string;
}

export interface Order11 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties439;
}

export interface Properties439 {
    id: Id172;
    version: Version8;
    order_change: OrderChange4;
    status: Status22;
    region_id: RegionId8;
    customer_id: CustomerId11;
    sales_channel_id: SalesChannelId6;
    email: Email12;
    currency_code: CurrencyCode28;
    shipping_address: ShippingAddress8;
    billing_address: BillingAddress8;
    items: Items407;
    shipping_methods: ShippingMethods8;
    transactions: Transactions7;
    summary: Summary6;
    metadata: Metadata129;
    canceled_at: CanceledAt11;
    created_at: CreatedAt103;
    updated_at: UpdatedAt97;
    original_item_total: OriginalItemTotal6;
    original_item_subtotal: OriginalItemSubtotal6;
    original_item_tax_total: OriginalItemTaxTotal6;
    item_total: ItemTotal10;
    item_subtotal: ItemSubtotal10;
    item_tax_total: ItemTaxTotal10;
    original_total: OriginalTotal14;
    original_subtotal: OriginalSubtotal14;
    original_tax_total: OriginalTaxTotal14;
    total: Total18;
    subtotal: Subtotal18;
    tax_total: TaxTotal14;
    discount_subtotal: DiscountSubtotal;
    discount_total: DiscountTotal14;
    discount_tax_total: DiscountTaxTotal14;
    gift_card_total: GiftCardTotal6;
    gift_card_tax_total: GiftCardTaxTotal6;
    shipping_total: ShippingTotal6;
    shipping_subtotal: ShippingSubtotal6;
    shipping_tax_total: ShippingTaxTotal6;
    original_shipping_total: OriginalShippingTotal6;
    original_shipping_subtotal: OriginalShippingSubtotal6;
    original_shipping_tax_total: OriginalShippingTaxTotal6;
    display_id: DisplayId8;
    credit_lines: CreditLines;
}

export interface Id172 {
    type: string;
    title: string;
    description: string;
}

export interface Version8 {
    type: string;
    title: string;
    description: string;
}

export interface OrderChange4 {
    type: string;
}

export interface Status22 {
    type: string;
    description: string;
    enum: string[];
}

export interface RegionId8 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId11 {
    type: string;
    title: string;
    description: string;
}

export interface SalesChannelId6 {
    type: string;
    title: string;
    description: string;
}

export interface Email12 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CurrencyCode28 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ShippingAddress8 {
    $ref: string;
}

export interface BillingAddress8 {
    $ref: string;
}

export interface Items407 {
    type: string;
    description: string;
    items: Items408;
}

export interface Items408 {
    $ref: string;
}

export interface ShippingMethods8 {
    type: string;
    description: string;
    items: Items409;
}

export interface Items409 {
    $ref: string;
}

export interface Transactions7 {
    type: string;
    description: string;
    items: Items410;
}

export interface Items410 {
    $ref: string;
}

export interface Summary6 {
    type: string;
    description: string;
}

export interface Metadata129 {
    type: string;
    description: string;
}

export interface CanceledAt11 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedAt103 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt97 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalItemTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemSubtotal6 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemTaxTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal10 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal10 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal10 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTotal14 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal14 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal14 {
    type: string;
    title: string;
    description: string;
}

export interface Total18 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal18 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal14 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountSubtotal {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal14 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal14 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTaxTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingSubtotal6 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTaxTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingSubtotal6 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTaxTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface DisplayId8 {
    type: string;
    title: string;
    description: string;
}

export interface CreditLines {
    type: string;
    description: string;
    items: Items411;
}

export interface Items411 {
    $ref: string;
}

export interface OrderAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties440;
}

export interface Properties440 {
    id: Id173;
    customer_id: CustomerId12;
    first_name: FirstName17;
    last_name: LastName17;
    phone: Phone17;
    company: Company16;
    address_1: Address116;
    address_2: Address216;
    city: City17;
    country_code: CountryCode19;
    province: Province16;
    postal_code: PostalCode16;
    metadata: Metadata130;
    created_at: CreatedAt104;
    updated_at: UpdatedAt98;
}

export interface Id173 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId12 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName17 {
    type: string;
    title: string;
    description: string;
}

export interface LastName17 {
    type: string;
    title: string;
    description: string;
}

export interface Phone17 {
    type: string;
    title: string;
    description: string;
}

export interface Company16 {
    type: string;
    title: string;
    description: string;
}

export interface Address116 {
    type: string;
    title: string;
    description: string;
}

export interface Address216 {
    type: string;
    title: string;
    description: string;
}

export interface City17 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode19 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Province16 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode16 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata130 {
    type: string;
    description: string;
}

export interface CreatedAt104 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt98 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OrderChange5 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties441;
}

export interface Properties441 {
    id: Id174;
    version: Version9;
    change_type: ChangeType2;
    order_id: OrderId20;
    return_id: ReturnId7;
    exchange_id: ExchangeId6;
    claim_id: ClaimId6;
    order: Order12;
    return_order: ReturnOrder2;
    exchange: Exchange6;
    claim: Claim6;
    actions: Actions4;
    status: Status23;
    requested_by: RequestedBy2;
    requested_at: RequestedAt2;
    confirmed_by: ConfirmedBy2;
    confirmed_at: ConfirmedAt2;
    declined_by: DeclinedBy2;
    declined_reason: DeclinedReason2;
    metadata: Metadata131;
    declined_at: DeclinedAt2;
    canceled_by: CanceledBy2;
    canceled_at: CanceledAt12;
    created_at: CreatedAt105;
    updated_at: UpdatedAt99;
}

export interface Id174 {
    type: string;
    title: string;
    description: string;
}

export interface Version9 {
    type: string;
    title: string;
    description: string;
}

export interface ChangeType2 {
    type: string;
    description: string;
    enum: string[];
}

export interface OrderId20 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId7 {
    type: string;
    title: string;
    description: string;
}

export interface ExchangeId6 {
    type: string;
    title: string;
    description: string;
}

export interface ClaimId6 {
    type: string;
    title: string;
    description: string;
}

export interface Order12 {
    type: string;
}

export interface ReturnOrder2 {
    type: string;
}

export interface Exchange6 {
    $ref: string;
}

export interface Claim6 {
    $ref: string;
}

export interface Actions4 {
    type: string;
    description: string;
    items: Items412;
}

export interface Items412 {
    $ref: string;
}

export interface Status23 {
    type: string;
    description: string;
    enum: string[];
}

export interface RequestedBy2 {
    type: string;
    title: string;
    description: string;
}

export interface RequestedAt2 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface ConfirmedBy2 {
    type: string;
    title: string;
    description: string;
}

export interface ConfirmedAt2 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DeclinedBy2 {
    type: string;
    title: string;
    description: string;
}

export interface DeclinedReason2 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata131 {
    type: string;
    description: string;
}

export interface DeclinedAt2 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CanceledBy2 {
    type: string;
    title: string;
    description: string;
}

export interface CanceledAt12 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CreatedAt105 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt99 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OrderChangeAction {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties442;
}

export interface Properties442 {
    id: Id175;
    order_change_id: OrderChangeId2;
    order_change: OrderChange6;
    order_id: OrderId21;
    return_id: ReturnId8;
    claim_id: ClaimId7;
    exchange_id: ExchangeId7;
    order: Order13;
    reference: Reference6;
    reference_id: ReferenceId6;
    action: Action3;
    details: Details2;
    internal_note: InternalNote31;
    created_at: CreatedAt106;
    updated_at: UpdatedAt100;
}

export interface Id175 {
    type: string;
    title: string;
    description: string;
}

export interface OrderChangeId2 {
    type: string;
    title: string;
    description: string;
}

export interface OrderChange6 {
    type: string;
}

export interface OrderId21 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId8 {
    type: string;
    title: string;
    description: string;
}

export interface ClaimId7 {
    type: string;
    title: string;
    description: string;
}

export interface ExchangeId7 {
    type: string;
    title: string;
    description: string;
}

export interface Order13 {
    $ref: string;
}

export interface Reference6 {
    type: string;
    title: string;
    description: string;
    enum: string[];
}

export interface ReferenceId6 {
    type: string;
    title: string;
    description: string;
}

export interface Action3 {
    type: string;
    description: string;
    enum: string[];
}

export interface Details2 {
    type: string;
    description: string;
    example: Example13;
}

export interface Example13 {
    reference_id: number;
    quantity: number;
}

export interface InternalNote31 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt106 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt100 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OrderClaim {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties443;
}

export interface Properties443 {
    id: Id176;
    order_id: OrderId22;
    claim_items: ClaimItems2;
    additional_items: AdditionalItems3;
    return: Return10;
    return_id: ReturnId9;
    no_notification: NoNotification10;
    refund_amount: RefundAmount3;
    display_id: DisplayId9;
    shipping_methods: ShippingMethods9;
    transactions: Transactions8;
    metadata: Metadata132;
    created_at: CreatedAt107;
    updated_at: UpdatedAt101;
    type: Type24;
    order: Order14;
    order_version: OrderVersion4;
    raw_refund_amount: RawRefundAmount;
    created_by: CreatedBy13;
    deleted_at: DeletedAt54;
    canceled_at: CanceledAt13;
}

export interface Id176 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId22 {
    type: string;
    title: string;
    description: string;
}

export interface ClaimItems2 {
    type: string;
    description: string;
    items: Items413;
}

export interface Items413 {
    $ref: string;
}

export interface AdditionalItems3 {
    type: string;
    description: string;
    items: Items414;
}

export interface Items414 {
    $ref: string;
}

export interface Return10 {
    type: string;
}

export interface ReturnId9 {
    type: string;
    title: string;
    description: string;
}

export interface NoNotification10 {
    type: string;
    title: string;
    description: string;
}

export interface RefundAmount3 {
    type: string;
    title: string;
    description: string;
}

export interface DisplayId9 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethods9 {
    type: string;
    description: string;
    items: Items415;
}

export interface Items415 {
    $ref: string;
}

export interface Transactions8 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
    items: Items416;
}

export interface ExternalDocs104 {
    url: string;
    description: string;
}

export interface Items416 {
    $ref: string;
}

export interface Metadata132 {
    type: string;
    description: string;
}

export interface CreatedAt107 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt101 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Type24 {
    type: string;
    description: string;
    enum: string[];
}

export interface Order14 {
    $ref: string;
}

export interface OrderVersion4 {
    type: string;
    title: string;
    description: string;
}

export interface RawRefundAmount {
    oneOf: OneOf76[];
}

export interface OneOf76 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedBy13 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt54 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CanceledAt13 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface OrderCreditLine {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties444;
}

export interface Properties444 {
    id: Id177;
    order_id: OrderId23;
    order: Order15;
    reference: Reference7;
    reference_id: ReferenceId7;
    metadata: Metadata133;
    created_at: CreatedAt108;
    updated_at: UpdatedAt102;
    amount: Amount25;
}

export interface Id177 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId23 {
    type: string;
    title: string;
    description: string;
}

export interface Order15 {
    type: string;
}

export interface Reference7 {
    type: string;
    title: string;
    description: string;
}

export interface ReferenceId7 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata133 {
    type: string;
    description: string;
}

export interface CreatedAt108 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt102 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Amount25 {
    type: string;
    title: string;
    description: string;
}

export interface OrderExchange {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties445;
}

export interface Properties445 {
    order_id: OrderId24;
    additional_items: AdditionalItems4;
    no_notification: NoNotification11;
    difference_due: DifferenceDue2;
    return: Return11;
    return_id: ReturnId10;
    id: Id178;
    display_id: DisplayId10;
    shipping_methods: ShippingMethods10;
    transactions: Transactions9;
    metadata: Metadata134;
    created_at: CreatedAt109;
    updated_at: UpdatedAt103;
    order: Order16;
    order_version: OrderVersion5;
    raw_difference_due: RawDifferenceDue;
    allow_backorder: AllowBackorder9;
    created_by: CreatedBy14;
    deleted_at: DeletedAt55;
    canceled_at: CanceledAt14;
}

export interface OrderId24 {
    type: string;
    title: string;
    description: string;
}

export interface AdditionalItems4 {
    type: string;
    description: string;
    items: Items417;
}

export interface Items417 {
    $ref: string;
}

export interface NoNotification11 {
    type: string;
    title: string;
    description: string;
}

export interface DifferenceDue2 {
    type: string;
    title: string;
    description: string;
}

export interface Return11 {
    $ref: string;
}

export interface ReturnId10 {
    type: string;
    title: string;
    description: string;
}

export interface Id178 {
    type: string;
    title: string;
    description: string;
}

export interface DisplayId10 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethods10 {
    type: string;
    description: string;
    items: Items418;
}

export interface Items418 {
    $ref: string;
}

export interface Transactions9 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
    items: Items419;
}

export interface ExternalDocs105 {
    url: string;
}

export interface Items419 {
    $ref: string;
}

export interface Metadata134 {
    type: string;
    description: string;
}

export interface CreatedAt109 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt103 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Order16 {
    $ref: string;
}

export interface OrderVersion5 {
    type: string;
    title: string;
    description: string;
}

export interface RawDifferenceDue {
    oneOf: OneOf77[];
}

export interface OneOf77 {
    type: string;
    title: string;
    description: string;
}

export interface AllowBackorder9 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedBy14 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt55 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CanceledAt14 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface OrderItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties446;
}

export interface Properties446 {
    id: Id179;
    item_id: ItemId10;
    item: Item7;
    quantity: Quantity28;
    fulfilled_quantity: FulfilledQuantity2;
    delivered_quantity: DeliveredQuantity2;
    shipped_quantity: ShippedQuantity2;
    return_requested_quantity: ReturnRequestedQuantity2;
    return_received_quantity: ReturnReceivedQuantity2;
    return_dismissed_quantity: ReturnDismissedQuantity2;
    written_off_quantity: WrittenOffQuantity2;
    metadata: Metadata135;
    created_at: CreatedAt110;
    updated_at: UpdatedAt104;
}

export interface Id179 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId10 {
    type: string;
    title: string;
    description: string;
}

export interface Item7 {
    type: string;
}

export interface Quantity28 {
    type: string;
    title: string;
    description: string;
}

export interface FulfilledQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface DeliveredQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface ShippedQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnRequestedQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnReceivedQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnDismissedQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface WrittenOffQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata135 {
    type: string;
    description: string;
}

export interface CreatedAt110 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt104 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OrderLineItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties447;
}

export interface Properties447 {
    id: Id180;
    title: Title37;
    subtitle: Subtitle10;
    thumbnail: Thumbnail12;
    variant_id: VariantId15;
    product_id: ProductId9;
    product_title: ProductTitle5;
    product_description: ProductDescription5;
    product_subtitle: ProductSubtitle5;
    product_type: ProductType6;
    product_collection: ProductCollection5;
    product_handle: ProductHandle5;
    variant_sku: VariantSku5;
    variant_barcode: VariantBarcode5;
    variant_title: VariantTitle5;
    variant_option_values: VariantOptionValues5;
    requires_shipping: RequiresShipping9;
    is_discountable: IsDiscountable5;
    is_tax_inclusive: IsTaxInclusive14;
    compare_at_unit_price: CompareAtUnitPrice8;
    unit_price: UnitPrice10;
    quantity: Quantity29;
    tax_lines: TaxLines9;
    adjustments: Adjustments9;
    detail: Detail6;
    created_at: CreatedAt111;
    updated_at: UpdatedAt105;
    metadata: Metadata136;
    original_total: OriginalTotal15;
    original_subtotal: OriginalSubtotal15;
    original_tax_total: OriginalTaxTotal15;
    item_total: ItemTotal11;
    item_subtotal: ItemSubtotal11;
    item_tax_total: ItemTaxTotal11;
    total: Total19;
    subtotal: Subtotal19;
    tax_total: TaxTotal15;
    discount_total: DiscountTotal15;
    discount_tax_total: DiscountTaxTotal15;
    refundable_total: RefundableTotal4;
    refundable_total_per_unit: RefundableTotalPerUnit4;
    product_type_id: ProductTypeId3;
}

export interface Id180 {
    type: string;
    title: string;
    description: string;
}

export interface Title37 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle10 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail12 {
    type: string;
    title: string;
    description: string;
}

export interface VariantId15 {
    type: string;
    title: string;
    description: string;
}

export interface ProductId9 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTitle5 {
    type: string;
    title: string;
    description: string;
}

export interface ProductDescription5 {
    type: string;
    title: string;
    description: string;
}

export interface ProductSubtitle5 {
    type: string;
    title: string;
    description: string;
}

export interface ProductType6 {
    type: string;
    title: string;
    description: string;
}

export interface ProductCollection5 {
    type: string;
    title: string;
    description: string;
}

export interface ProductHandle5 {
    type: string;
    title: string;
    description: string;
}

export interface VariantSku5 {
    type: string;
    title: string;
    description: string;
}

export interface VariantBarcode5 {
    type: string;
    title: string;
    description: string;
}

export interface VariantTitle5 {
    type: string;
    title: string;
    description: string;
}

export interface VariantOptionValues5 {
    type: string;
    description: string;
    example: Example14;
}

export interface Example14 {
    Color: string;
}

export interface RequiresShipping9 {
    type: string;
    title: string;
    description: string;
}

export interface IsDiscountable5 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive14 {
    type: string;
    title: string;
    description: string;
}

export interface CompareAtUnitPrice8 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice10 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity29 {
    type: string;
    title: string;
    description: string;
}

export interface TaxLines9 {
    type: string;
    description: string;
    items: Items420;
}

export interface Items420 {
    $ref: string;
}

export interface Adjustments9 {
    type: string;
    description: string;
    items: Items421;
}

export interface Items421 {
    $ref: string;
}

export interface Detail6 {
    $ref: string;
}

export interface CreatedAt111 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt105 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata136 {
    type: string;
    description: string;
}

export interface OriginalTotal15 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal15 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal15 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal11 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal11 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal11 {
    type: string;
    title: string;
    description: string;
}

export interface Total19 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal19 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal15 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal15 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal15 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotal4 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotalPerUnit4 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTypeId3 {
    type: string;
    title: string;
    description: string;
}

export interface OrderLineItemAdjustment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties448;
}

export interface Properties448 {
    item: Item8;
    item_id: ItemId11;
    id: Id181;
    code: Code18;
    amount: Amount26;
    order_id: OrderId25;
    description: Description57;
    promotion_id: PromotionId5;
    provider_id: ProviderId20;
    created_at: CreatedAt112;
    updated_at: UpdatedAt106;
}

export interface Item8 {
    type: string;
}

export interface ItemId11 {
    type: string;
    title: string;
    description: string;
}

export interface Id181 {
    type: string;
    title: string;
    description: string;
}

export interface Code18 {
    type: string;
    title: string;
    description: string;
}

export interface Amount26 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId25 {
    type: string;
    title: string;
    description: string;
}

export interface Description57 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId5 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId20 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt112 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt106 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OrderLineItemTaxLine {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties449;
}

export interface Properties449 {
    item: Item9;
    item_id: ItemId12;
    total: Total20;
    subtotal: Subtotal20;
    id: Id182;
    description: Description58;
    tax_rate_id: TaxRateId5;
    code: Code19;
    rate: Rate9;
    provider_id: ProviderId21;
    created_at: CreatedAt113;
    updated_at: UpdatedAt107;
}

export interface Item9 {
    type: string;
}

export interface ItemId12 {
    type: string;
    title: string;
    description: string;
}

export interface Total20 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal20 {
    type: string;
    title: string;
    description: string;
}

export interface Id182 {
    type: string;
    title: string;
    description: string;
}

export interface Description58 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId5 {
    type: string;
    title: string;
    description: string;
}

export interface Code19 {
    type: string;
    title: string;
    description: string;
}

export interface Rate9 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId21 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt113 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt107 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OrderReturnItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties450;
}

export interface Properties450 {
    id: Id183;
    quantity: Quantity30;
    received_quantity: ReceivedQuantity2;
    reason_id: ReasonId8;
    item_id: ItemId13;
    return_id: ReturnId11;
    metadata: Metadata137;
    order_id: OrderId26;
    created_at: CreatedAt114;
    updated_at: UpdatedAt108;
    damaged_quantity: DamagedQuantity2;
}

export interface Id183 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity30 {
    type: string;
    title: string;
    description: string;
}

export interface ReceivedQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface ReasonId8 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId13 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId11 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata137 {
    type: string;
    description: string;
}

export interface OrderId26 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt114 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt108 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DamagedQuantity2 {
    type: string;
    title: string;
    description: string;
}

export interface OrderShippingMethod {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties451;
}

export interface Properties451 {
    id: Id184;
    order_id: OrderId27;
    name: Name39;
    description: Description59;
    amount: Amount27;
    is_tax_inclusive: IsTaxInclusive15;
    shipping_option_id: ShippingOptionId15;
    data: Data18;
    metadata: Metadata138;
    tax_lines: TaxLines10;
    adjustments: Adjustments10;
    created_at: CreatedAt115;
    updated_at: UpdatedAt109;
    original_total: OriginalTotal16;
    original_subtotal: OriginalSubtotal16;
    original_tax_total: OriginalTaxTotal16;
    total: Total21;
    subtotal: Subtotal21;
    tax_total: TaxTotal16;
    discount_total: DiscountTotal16;
    discount_tax_total: DiscountTaxTotal16;
}

export interface Id184 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId27 {
    type: string;
    title: string;
    description: string;
}

export interface Name39 {
    type: string;
    title: string;
    description: string;
}

export interface Description59 {
    type: string;
    title: string;
    description: string;
}

export interface Amount27 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive15 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId15 {
    type: string;
    title: string;
    description: string;
}

export interface Data18 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs106 {
    url: string;
}

export interface Metadata138 {
    type: string;
    description: string;
}

export interface TaxLines10 {
    type: string;
    description: string;
    items: Items422;
}

export interface Items422 {
    $ref: string;
}

export interface Adjustments10 {
    type: string;
    description: string;
    items: Items423;
}

export interface Items423 {
    $ref: string;
}

export interface CreatedAt115 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt109 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalTotal16 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal16 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal16 {
    type: string;
    title: string;
    description: string;
}

export interface Total21 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal21 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal16 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal16 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal16 {
    type: string;
    title: string;
    description: string;
}

export interface OrderShippingMethodAdjustment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties452;
}

export interface Properties452 {
    shipping_method: ShippingMethod6;
    shipping_method_id: ShippingMethodId6;
    id: Id185;
    code: Code20;
    amount: Amount28;
    order_id: OrderId28;
    description: Description60;
    promotion_id: PromotionId6;
    provider_id: ProviderId22;
    created_at: CreatedAt116;
    updated_at: UpdatedAt110;
}

export interface ShippingMethod6 {
    type: string;
}

export interface ShippingMethodId6 {
    type: string;
    title: string;
    description: string;
}

export interface Id185 {
    type: string;
    title: string;
    description: string;
}

export interface Code20 {
    type: string;
    title: string;
    description: string;
}

export interface Amount28 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId28 {
    type: string;
    title: string;
    description: string;
}

export interface Description60 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId6 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId22 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt116 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt110 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OrderShippingMethodTaxLine {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties453;
}

export interface Properties453 {
    shipping_method: ShippingMethod7;
    shipping_method_id: ShippingMethodId7;
    total: Total22;
    subtotal: Subtotal22;
    id: Id186;
    description: Description61;
    tax_rate_id: TaxRateId6;
    code: Code21;
    rate: Rate10;
    provider_id: ProviderId23;
    created_at: CreatedAt117;
    updated_at: UpdatedAt111;
}

export interface ShippingMethod7 {
    type: string;
}

export interface ShippingMethodId7 {
    type: string;
    title: string;
    description: string;
}

export interface Total22 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal22 {
    type: string;
    title: string;
    description: string;
}

export interface Id186 {
    type: string;
    title: string;
    description: string;
}

export interface Description61 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId6 {
    type: string;
    title: string;
    description: string;
}

export interface Code21 {
    type: string;
    title: string;
    description: string;
}

export interface Rate10 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId23 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt117 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt111 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OrderTransaction {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties454;
}

export interface Properties454 {
    id: Id187;
    order_id: OrderId29;
    amount: Amount29;
    currency_code: CurrencyCode29;
    reference: Reference8;
    reference_id: ReferenceId8;
    metadata: Metadata139;
    created_at: CreatedAt118;
    updated_at: UpdatedAt112;
    order: Order17;
    version: Version10;
}

export interface Id187 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId29 {
    type: string;
    title: string;
    description: string;
}

export interface Amount29 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode29 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Reference8 {
    type: string;
    title: string;
    description: string;
    enum: string[];
}

export interface ReferenceId8 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata139 {
    type: string;
    description: string;
}

export interface CreatedAt118 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt112 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Order17 {
    type: string;
}

export interface Version10 {
    type: string;
    title: string;
    description: string;
}

export interface RefundReason3 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties455;
}

export interface Properties455 {
    id: Id188;
    label: Label11;
    description: Description62;
    metadata: Metadata140;
    created_at: CreatedAt119;
    updated_at: UpdatedAt113;
}

export interface Id188 {
    type: string;
    title: string;
    description: string;
}

export interface Label11 {
    type: string;
    title: string;
    description: string;
}

export interface Description62 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata140 {
    type: string;
    description: string;
}

export interface CreatedAt119 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt113 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface RefundReasonResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties456;
}

export interface Properties456 {
    refund_reason: RefundReason4;
}

export interface RefundReason4 {
    $ref: string;
}

export interface Return12 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties457;
}

export interface Properties457 {
    id: Id189;
    status: Status24;
    refund_amount: RefundAmount4;
    order_id: OrderId30;
    items: Items424;
    shipping_methods: ShippingMethods11;
    transactions: Transactions10;
    metadata: Metadata141;
    created_at: CreatedAt120;
    updated_at: UpdatedAt114;
    canceled_at: CanceledAt15;
    raw_refund_amount: RawRefundAmount2;
    order: Order18;
    exchange_id: ExchangeId8;
    exchange: Exchange7;
    claim_id: ClaimId8;
    claim: Claim7;
    display_id: DisplayId11;
    location_id: LocationId16;
    no_notification: NoNotification12;
    created_by: CreatedBy15;
    deleted_at: DeletedAt56;
    requested_at: RequestedAt3;
    received_at: ReceivedAt2;
}

export interface Id189 {
    type: string;
    title: string;
    description: string;
}

export interface Status24 {
    type: string;
    description: string;
    enum: string[];
}

export interface RefundAmount4 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId30 {
    type: string;
    title: string;
    description: string;
}

export interface Items424 {
    type: string;
    description: string;
    items: Items425;
}

export interface Items425 {
    $ref: string;
}

export interface ShippingMethods11 {
    type: string;
    description: string;
    items: Items426;
}

export interface Items426 {
    $ref: string;
}

export interface Transactions10 {
    type: string;
    description: string;
    items: Items427;
}

export interface Items427 {
    $ref: string;
}

export interface Metadata141 {
    type: string;
    description: string;
}

export interface CreatedAt120 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt114 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CanceledAt15 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface RawRefundAmount2 {
    oneOf: OneOf78[];
}

export interface OneOf78 {
    type: string;
    title: string;
    description: string;
}

export interface Order18 {
    $ref: string;
}

export interface ExchangeId8 {
    type: string;
    title: string;
    description: string;
}

export interface Exchange7 {
    type: string;
}

export interface ClaimId8 {
    type: string;
    title: string;
    description: string;
}

export interface Claim7 {
    $ref: string;
}

export interface DisplayId11 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId16 {
    type: string;
    title: string;
    description: string;
}

export interface NoNotification12 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedBy15 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt56 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface RequestedAt3 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface ReceivedAt2 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface StoreAcceptOrderTransfer {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties458;
}

export interface Properties458 {
    token: Token5;
}

export interface Token5 {
    type: string;
    title: string;
    description: string;
}

export interface StoreAddCartLineItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties459;
}

export interface Properties459 {
    variant_id: VariantId16;
    quantity: Quantity31;
    metadata: Metadata142;
}

export interface VariantId16 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity31 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata142 {
    type: string;
    description: string;
}

export interface StoreCalculatedPrice {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties460;
}

export interface Properties460 {
    id: Id190;
    is_calculated_price_price_list: IsCalculatedPricePriceList2;
    is_calculated_price_tax_inclusive: IsCalculatedPriceTaxInclusive2;
    calculated_amount: CalculatedAmount2;
    calculated_amount_with_tax: CalculatedAmountWithTax2;
    calculated_amount_without_tax: CalculatedAmountWithoutTax2;
    is_original_price_price_list: IsOriginalPricePriceList2;
    is_original_price_tax_inclusive: IsOriginalPriceTaxInclusive2;
    original_amount: OriginalAmount2;
    currency_code: CurrencyCode30;
    calculated_price: CalculatedPrice4;
    original_price: OriginalPrice2;
    original_amount_with_tax: OriginalAmountWithTax2;
    original_amount_without_tax: OriginalAmountWithoutTax2;
}

export interface Id190 {
    type: string;
    title: string;
    description: string;
}

export interface IsCalculatedPricePriceList2 {
    type: string;
    title: string;
    description: string;
}

export interface IsCalculatedPriceTaxInclusive2 {
    type: string;
    title: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs107 {
    url: string;
}

export interface CalculatedAmount2 {
    type: string;
    title: string;
    description: string;
}

export interface CalculatedAmountWithTax2 {
    type: string;
    title: string;
    description: string;
}

export interface CalculatedAmountWithoutTax2 {
    type: string;
    title: string;
    description: string;
}

export interface IsOriginalPricePriceList2 {
    type: string;
    title: string;
    description: string;
}

export interface IsOriginalPriceTaxInclusive2 {
    type: string;
    title: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs108 {
    url: string;
}

export interface OriginalAmount2 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode30 {
    type: string;
    title: string;
    description: string;
}

export interface CalculatedPrice4 {
    type: string;
    description: string;
    required: string[];
    properties: Properties461;
}

export interface Properties461 {
    id: Id191;
    price_list_id: PriceListId;
    price_list_type: PriceListType;
    min_quantity: MinQuantity6;
    max_quantity: MaxQuantity7;
}

export interface Id191 {
    type: string;
    title: string;
    description: string;
}

export interface PriceListId {
    type: string;
    title: string;
    description: string;
}

export interface PriceListType {
    type: string;
    title: string;
    description: string;
}

export interface MinQuantity6 {
    type: string;
    title: string;
    description: string;
}

export interface MaxQuantity7 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalPrice2 {
    type: string;
    description: string;
    required: string[];
    properties: Properties462;
}

export interface Properties462 {
    id: Id192;
    price_list_id: PriceListId2;
    price_list_type: PriceListType2;
    min_quantity: MinQuantity7;
    max_quantity: MaxQuantity8;
}

export interface Id192 {
    type: string;
    title: string;
    description: string;
}

export interface PriceListId2 {
    type: string;
    title: string;
    description: string;
}

export interface PriceListType2 {
    type: string;
    title: string;
    description: string;
}

export interface MinQuantity7 {
    type: string;
    title: string;
    description: string;
}

export interface MaxQuantity8 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalAmountWithTax2 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalAmountWithoutTax2 {
    type: string;
    title: string;
    description: string;
}

export interface StoreCart {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties463;
}

export interface Properties463 {
    id: Id193;
    region: Region4;
    region_id: RegionId9;
    customer_id: CustomerId13;
    sales_channel_id: SalesChannelId7;
    email: Email13;
    currency_code: CurrencyCode31;
    shipping_address: ShippingAddress9;
    billing_address: BillingAddress9;
    items: Items428;
    shipping_methods: ShippingMethods12;
    payment_collection: PaymentCollection7;
    metadata: Metadata143;
    created_at: CreatedAt121;
    updated_at: UpdatedAt115;
    original_item_total: OriginalItemTotal7;
    original_item_subtotal: OriginalItemSubtotal7;
    original_item_tax_total: OriginalItemTaxTotal7;
    item_total: ItemTotal12;
    item_subtotal: ItemSubtotal12;
    item_tax_total: ItemTaxTotal12;
    original_total: OriginalTotal17;
    original_subtotal: OriginalSubtotal17;
    original_tax_total: OriginalTaxTotal17;
    total: Total23;
    subtotal: Subtotal23;
    tax_total: TaxTotal17;
    discount_total: DiscountTotal17;
    discount_tax_total: DiscountTaxTotal17;
    gift_card_total: GiftCardTotal7;
    gift_card_tax_total: GiftCardTaxTotal7;
    shipping_total: ShippingTotal7;
    shipping_subtotal: ShippingSubtotal7;
    shipping_tax_total: ShippingTaxTotal7;
    original_shipping_total: OriginalShippingTotal7;
    original_shipping_subtotal: OriginalShippingSubtotal7;
    original_shipping_tax_total: OriginalShippingTaxTotal7;
    promotions: Promotions;
}

export interface Id193 {
    type: string;
    title: string;
    description: string;
}

export interface Region4 {
    $ref: string;
}

export interface RegionId9 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId13 {
    type: string;
    title: string;
    description: string;
}

export interface SalesChannelId7 {
    type: string;
    title: string;
    description: string;
}

export interface Email13 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CurrencyCode31 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ShippingAddress9 {
    $ref: string;
}

export interface BillingAddress9 {
    $ref: string;
}

export interface Items428 {
    type: string;
    description: string;
    items: Items429;
}

export interface Items429 {
    $ref: string;
}

export interface ShippingMethods12 {
    type: string;
    description: string;
    items: Items430;
}

export interface Items430 {
    $ref: string;
}

export interface PaymentCollection7 {
    $ref: string;
}

export interface Metadata143 {
    type: string;
    description: string;
}

export interface CreatedAt121 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt115 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalItemTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemSubtotal7 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemTaxTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal12 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal12 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal12 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTotal17 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal17 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal17 {
    type: string;
    title: string;
    description: string;
}

export interface Total23 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal23 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal17 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal17 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal17 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTaxTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingSubtotal7 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTaxTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingSubtotal7 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTaxTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface Promotions {
    type: string;
    description: string;
    items: Items431;
}

export interface Items431 {
    $ref: string;
}

export interface StoreCartAddPromotion {
    "type": string;
    "description": string;
    "required": string[];
    "properties": Properties464;
    "x-schemaName": string;
}

export interface Properties464 {
    promo_codes: PromoCodes;
}

export interface PromoCodes {
    type: string;
    description: string;
    items: Items432;
}

export interface Items432 {
    type: string;
    title: string;
    description: string;
}

export interface StoreCartAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties465;
}

export interface Properties465 {
    id: Id194;
    customer_id: CustomerId14;
    first_name: FirstName18;
    last_name: LastName18;
    phone: Phone18;
    company: Company17;
    address_1: Address117;
    address_2: Address217;
    city: City18;
    country_code: CountryCode20;
    province: Province17;
    postal_code: PostalCode17;
    metadata: Metadata144;
    created_at: CreatedAt122;
    updated_at: UpdatedAt116;
}

export interface Id194 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId14 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName18 {
    type: string;
    title: string;
    description: string;
}

export interface LastName18 {
    type: string;
    title: string;
    description: string;
}

export interface Phone18 {
    type: string;
    title: string;
    description: string;
}

export interface Company17 {
    type: string;
    title: string;
    description: string;
}

export interface Address117 {
    type: string;
    title: string;
    description: string;
}

export interface Address217 {
    type: string;
    title: string;
    description: string;
}

export interface City18 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode20 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Province17 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode17 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata144 {
    type: string;
    description: string;
}

export interface CreatedAt122 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface UpdatedAt116 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface StoreCartLineItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties466;
}

export interface Properties466 {
    id: Id195;
    title: Title38;
    subtitle: Subtitle11;
    thumbnail: Thumbnail13;
    quantity: Quantity32;
    product: Product11;
    product_id: ProductId10;
    product_title: ProductTitle6;
    product_description: ProductDescription6;
    product_subtitle: ProductSubtitle6;
    product_type: ProductType7;
    product_collection: ProductCollection6;
    product_handle: ProductHandle6;
    variant: Variant7;
    variant_id: VariantId17;
    variant_sku: VariantSku6;
    variant_barcode: VariantBarcode6;
    variant_title: VariantTitle6;
    variant_option_values: VariantOptionValues6;
    requires_shipping: RequiresShipping10;
    is_discountable: IsDiscountable6;
    is_tax_inclusive: IsTaxInclusive16;
    compare_at_unit_price: CompareAtUnitPrice9;
    unit_price: UnitPrice11;
    tax_lines: TaxLines11;
    adjustments: Adjustments11;
    cart: Cart5;
    cart_id: CartId7;
    metadata: Metadata145;
    created_at: CreatedAt125;
    updated_at: UpdatedAt119;
    deleted_at: DeletedAt57;
    original_total: OriginalTotal18;
    original_subtotal: OriginalSubtotal18;
    original_tax_total: OriginalTaxTotal18;
    item_total: ItemTotal13;
    item_subtotal: ItemSubtotal13;
    item_tax_total: ItemTaxTotal13;
    total: Total25;
    subtotal: Subtotal25;
    tax_total: TaxTotal18;
    discount_total: DiscountTotal18;
    discount_tax_total: DiscountTaxTotal18;
}

export interface Id195 {
    type: string;
    title: string;
    description: string;
}

export interface Title38 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle11 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail13 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity32 {
    type: string;
    title: string;
    description: string;
}

export interface Product11 {
    $ref: string;
}

export interface ProductId10 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTitle6 {
    type: string;
    title: string;
    description: string;
}

export interface ProductDescription6 {
    type: string;
    title: string;
    description: string;
}

export interface ProductSubtitle6 {
    type: string;
    title: string;
    description: string;
}

export interface ProductType7 {
    type: string;
    title: string;
    description: string;
}

export interface ProductCollection6 {
    type: string;
    title: string;
    description: string;
}

export interface ProductHandle6 {
    type: string;
    title: string;
    description: string;
}

export interface Variant7 {
    $ref: string;
}

export interface VariantId17 {
    type: string;
    title: string;
    description: string;
}

export interface VariantSku6 {
    type: string;
    title: string;
    description: string;
}

export interface VariantBarcode6 {
    type: string;
    title: string;
    description: string;
}

export interface VariantTitle6 {
    type: string;
    title: string;
    description: string;
}

export interface VariantOptionValues6 {
    type: string;
    description: string;
    example: Example15;
}

export interface Example15 {
    Color: string;
}

export interface RequiresShipping10 {
    type: string;
    title: string;
    description: string;
}

export interface IsDiscountable6 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive16 {
    type: string;
    title: string;
    description: string;
}

export interface CompareAtUnitPrice9 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice11 {
    type: string;
    title: string;
    description: string;
}

export interface TaxLines11 {
    type: string;
    description: string;
    items: Items433;
}

export interface Items433 {
    allOf: AllOf13[];
    description: string;
}

export interface AllOf13 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties467;
}

export interface Properties467 {
    item: Item10;
    item_id?: ItemId14;
    total?: Total24;
    subtotal?: Subtotal24;
    id?: Id196;
    description?: Description63;
    tax_rate_id?: TaxRateId7;
    code?: Code22;
    rate?: Rate11;
    provider_id?: ProviderId24;
    created_at?: CreatedAt123;
    updated_at?: UpdatedAt117;
}

export interface Item10 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId14 {
    type: string;
    title: string;
    description: string;
}

export interface Total24 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal24 {
    type: string;
    title: string;
    description: string;
}

export interface Id196 {
    type: string;
    title: string;
    description: string;
}

export interface Description63 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId7 {
    type: string;
    title: string;
    description: string;
}

export interface Code22 {
    type: string;
    title: string;
    description: string;
}

export interface Rate11 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId24 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt123 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt117 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Adjustments11 {
    type: string;
    description: string;
    items: Items434;
}

export interface Items434 {
    allOf: AllOf14[];
    description: string;
}

export interface AllOf14 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties468;
}

export interface Properties468 {
    item: Item11;
    item_id?: ItemId15;
    id?: Id197;
    code?: Code23;
    amount?: Amount30;
    cart_id?: CartId6;
    description?: Description64;
    promotion_id?: PromotionId7;
    provider_id?: ProviderId25;
    created_at?: CreatedAt124;
    updated_at?: UpdatedAt118;
}

export interface Item11 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId15 {
    type: string;
    title: string;
    description: string;
}

export interface Id197 {
    type: string;
    title: string;
    description: string;
}

export interface Code23 {
    type: string;
    title: string;
    description: string;
}

export interface Amount30 {
    type: string;
    title: string;
    description: string;
}

export interface CartId6 {
    type: string;
    title: string;
    description: string;
}

export interface Description64 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId7 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId25 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt124 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt118 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Cart5 {
    type: string;
}

export interface CartId7 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata145 {
    type: string;
    description: string;
}

export interface CreatedAt125 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface UpdatedAt119 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DeletedAt57 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface OriginalTotal18 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal18 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal18 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal13 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal13 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal13 {
    type: string;
    title: string;
    description: string;
}

export interface Total25 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal25 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal18 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal18 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal18 {
    type: string;
    title: string;
    description: string;
}

export interface StoreCartPromotion {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties469;
}

export interface Properties469 {
    id: Id198;
    code: Code24;
    is_automatic: IsAutomatic2;
    application_method: ApplicationMethod2;
}

export interface Id198 {
    type: string;
    title: string;
    description: string;
}

export interface Code24 {
    type: string;
    title: string;
    description: string;
}

export interface IsAutomatic2 {
    type: string;
    title: string;
    description: string;
}

export interface ApplicationMethod2 {
    type: string;
    description: string;
    required: string[];
    properties: Properties470;
}

export interface Properties470 {
    value: Value26;
    type: Type25;
    currency_code: CurrencyCode32;
}

export interface Value26 {
    type: string;
    title: string;
    description: string;
}

export interface Type25 {
    type: string;
    description: string;
    enum: string[];
}

export interface CurrencyCode32 {
    type: string;
    title: string;
    description: string;
}

export interface StoreCartResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties471;
}

export interface Properties471 {
    cart: Cart6;
}

export interface Cart6 {
    $ref: string;
}

export interface StoreCartShippingMethod {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties472;
}

export interface Properties472 {
    id: Id199;
    cart_id: CartId8;
    name: Name40;
    description: Description65;
    amount: Amount31;
    is_tax_inclusive: IsTaxInclusive17;
    shipping_option_id: ShippingOptionId16;
    data: Data19;
    metadata: Metadata146;
    tax_lines: TaxLines12;
    adjustments: Adjustments12;
    created_at: CreatedAt128;
    updated_at: UpdatedAt122;
    original_total: OriginalTotal19;
    original_subtotal: OriginalSubtotal19;
    original_tax_total: OriginalTaxTotal19;
    total: Total27;
    subtotal: Subtotal27;
    tax_total: TaxTotal19;
    discount_total: DiscountTotal19;
    discount_tax_total: DiscountTaxTotal19;
}

export interface Id199 {
    type: string;
    title: string;
    description: string;
}

export interface CartId8 {
    type: string;
    title: string;
    description: string;
}

export interface Name40 {
    type: string;
    title: string;
    description: string;
}

export interface Description65 {
    type: string;
    title: string;
    description: string;
}

export interface Amount31 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive17 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId16 {
    type: string;
    title: string;
    description: string;
}

export interface Data19 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs109 {
    url: string;
}

export interface Metadata146 {
    type: string;
    description: string;
}

export interface TaxLines12 {
    type: string;
    description: string;
    items: Items435;
}

export interface Items435 {
    allOf: AllOf15[];
    description: string;
}

export interface AllOf15 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties473;
}

export interface Properties473 {
    shipping_method: ShippingMethod8;
    shipping_method_id?: ShippingMethodId8;
    total?: Total26;
    subtotal?: Subtotal26;
    id?: Id200;
    description?: Description66;
    tax_rate_id?: TaxRateId8;
    code?: Code25;
    rate?: Rate12;
    provider_id?: ProviderId26;
    created_at?: CreatedAt126;
    updated_at?: UpdatedAt120;
}

export interface ShippingMethod8 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethodId8 {
    type: string;
    title: string;
    description: string;
}

export interface Total26 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal26 {
    type: string;
    title: string;
    description: string;
}

export interface Id200 {
    type: string;
    title: string;
    description: string;
}

export interface Description66 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId8 {
    type: string;
    title: string;
    description: string;
}

export interface Code25 {
    type: string;
    title: string;
    description: string;
}

export interface Rate12 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId26 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt126 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt120 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Adjustments12 {
    type: string;
    description: string;
    items: Items436;
}

export interface Items436 {
    allOf: AllOf16[];
    description: string;
}

export interface AllOf16 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties474;
}

export interface Properties474 {
    shipping_method: ShippingMethod9;
    id?: Id201;
    code?: Code26;
    amount?: Amount32;
    cart_id?: CartId9;
    description?: Description67;
    promotion_id?: PromotionId8;
    provider_id?: ProviderId27;
    created_at?: CreatedAt127;
    updated_at?: UpdatedAt121;
}

export interface ShippingMethod9 {
    type: string;
    title: string;
    description: string;
}

export interface Id201 {
    type: string;
    title: string;
    description: string;
}

export interface Code26 {
    type: string;
    title: string;
    description: string;
}

export interface Amount32 {
    type: string;
    title: string;
    description: string;
}

export interface CartId9 {
    type: string;
    title: string;
    description: string;
}

export interface Description67 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId8 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId27 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt127 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt121 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedAt128 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt122 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalTotal19 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal19 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal19 {
    type: string;
    title: string;
    description: string;
}

export interface Total27 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal27 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal19 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal19 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal19 {
    type: string;
    title: string;
    description: string;
}

export interface StoreCartShippingOption {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties475;
}

export interface Properties475 {
    id: Id202;
    name: Name41;
    price_type: PriceType3;
    service_zone_id: ServiceZoneId3;
    provider_id: ProviderId28;
    provider: Provider3;
    type: Type26;
    shipping_profile_id: ShippingProfileId5;
    amount: Amount33;
    data: Data20;
    prices: Prices9;
    calculated_price: CalculatedPrice5;
    insufficient_inventory: InsufficientInventory;
}

export interface Id202 {
    type: string;
    title: string;
    description: string;
}

export interface Name41 {
    type: string;
    title: string;
    description: string;
}

export interface PriceType3 {
    type: string;
    description: string;
    enum: string[];
}

export interface ServiceZoneId3 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId28 {
    type: string;
    title: string;
    description: string;
}

export interface Provider3 {
    type: string;
    description: string;
    required: string[];
    properties: Properties476;
}

export interface Properties476 {
    id: Id203;
    is_enabled: IsEnabled4;
}

export interface Id203 {
    type: string;
    title: string;
    description: string;
}

export interface IsEnabled4 {
    type: string;
    title: string;
    description: string;
}

export interface Type26 {
    type: string;
    description: string;
    required: string[];
    properties: Properties477;
}

export interface Properties477 {
    id: Id204;
    label: Label12;
    description: Description68;
    code: Code27;
}

export interface Id204 {
    type: string;
    title: string;
    description: string;
}

export interface Label12 {
    type: string;
    title: string;
    description: string;
}

export interface Description68 {
    type: string;
    title: string;
    description: string;
}

export interface Code27 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingProfileId5 {
    type: string;
    title: string;
    description: string;
}

export interface Amount33 {
    type: string;
    title: string;
    description: string;
}

export interface Data20 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs110 {
    url: string;
}

export interface Prices9 {
    type: string;
    description: string;
    items: Items437;
}

export interface Items437 {
    $ref: string;
}

export interface CalculatedPrice5 {
    $ref: string;
}

export interface InsufficientInventory {
    type: string;
    title: string;
    description: string;
}

export interface StoreCollection {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties478;
}

export interface Properties478 {
    id: Id205;
    title: Title39;
    handle: Handle13;
    created_at: CreatedAt129;
    updated_at: UpdatedAt123;
    deleted_at: DeletedAt58;
    products: Products6;
    metadata: Metadata147;
}

export interface Id205 {
    type: string;
    title: string;
    description: string;
}

export interface Title39 {
    type: string;
    title: string;
    description: string;
}

export interface Handle13 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt129 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt123 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt58 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Products6 {
    type: string;
    description: string;
    items: Items438;
}

export interface Items438 {
    type: string;
}

export interface Metadata147 {
    type: string;
    description: string;
}

export interface StoreCollectionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties479;
}

export interface Properties479 {
    collection: Collection4;
}

export interface Collection4 {
    $ref: string;
}

export interface StoreCreateCart {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties480;
}

export interface Properties480 {
    region_id: RegionId10;
    shipping_address: ShippingAddress10;
    billing_address: BillingAddress10;
    email: Email14;
    currency_code: CurrencyCode33;
    items: Items439;
    sales_channel_id: SalesChannelId8;
    metadata: Metadata148;
}

export interface RegionId10 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingAddress10 {
    $ref: string;
}

export interface BillingAddress10 {
    $ref: string;
}

export interface Email14 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CurrencyCode33 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Items439 {
    type: string;
    description: string;
    items: Items440;
}

export interface Items440 {
    $ref: string;
}

export interface SalesChannelId8 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata148 {
    type: string;
    description: string;
}

export interface StoreCreateCustomer {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties481;
}

export interface Properties481 {
    email: Email15;
    company_name: CompanyName3;
    first_name: FirstName19;
    last_name: LastName19;
    phone: Phone19;
    metadata: Metadata149;
}

export interface Email15 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CompanyName3 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName19 {
    type: string;
    title: string;
    description: string;
}

export interface LastName19 {
    type: string;
    title: string;
    description: string;
}

export interface Phone19 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata149 {
    type: string;
    description: string;
}

export interface StoreCreatePaymentCollection {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties482;
}

export interface Properties482 {
    cart_id: CartId10;
}

export interface CartId10 {
    type: string;
    title: string;
    description: string;
}

export interface StoreCreateReturn {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties483;
}

export interface Properties483 {
    order_id: OrderId31;
    items: Items441;
    return_shipping: ReturnShipping;
    note: Note4;
    receive_now: ReceiveNow;
    location_id: LocationId17;
}

export interface OrderId31 {
    type: string;
    title: string;
    description: string;
}

export interface Items441 {
    type: string;
    description: string;
    items: Items442;
}

export interface Items442 {
    $ref: string;
}

export interface ReturnShipping {
    $ref: string;
}

export interface Note4 {
    type: string;
    title: string;
    description: string;
}

export interface ReceiveNow {
    type: string;
    title: string;
    description: string;
}

export interface LocationId17 {
    type: string;
    title: string;
    description: string;
}

export interface StoreCreateReturnItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties484;
}

export interface Properties484 {
    id: Id206;
    quantity: Quantity33;
    reason_id: ReasonId9;
    note: Note5;
}

export interface Id206 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity33 {
    type: string;
    title: string;
    description: string;
}

export interface ReasonId9 {
    type: string;
    title: string;
    description: string;
}

export interface Note5 {
    type: string;
    title: string;
    description: string;
}

export interface StoreCreateReturnShipping {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties485;
}

export interface Properties485 {
    option_id: OptionId5;
    price: Price;
}

export interface OptionId5 {
    type: string;
    title: string;
    description: string;
}

export interface Price {
    type: string;
    title: string;
    description: string;
}

export interface StoreCurrency {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties486;
}

export interface Properties486 {
    code: Code28;
    symbol: Symbol2;
    symbol_native: SymbolNative2;
    name: Name42;
    decimal_digits: DecimalDigits2;
    rounding: Rounding2;
    created_at: CreatedAt130;
    updated_at: UpdatedAt124;
    deleted_at: DeletedAt59;
}

export interface Code28 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Symbol2 {
    type: string;
    title: string;
    description: string;
}

export interface SymbolNative2 {
    type: string;
    title: string;
    description: string;
}

export interface Name42 {
    type: string;
    title: string;
    description: string;
}

export interface DecimalDigits2 {
    type: string;
    title: string;
    description: string;
}

export interface Rounding2 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt130 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt124 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt59 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface StoreCurrencyListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties487;
}

export interface Properties487 {
    limit: Limit25;
    offset: Offset23;
    count: Count23;
    currencies: Currencies2;
}

export interface Limit25 {
    type: string;
    title: string;
    description: string;
}

export interface Offset23 {
    type: string;
    title: string;
    description: string;
}

export interface Count23 {
    type: string;
    title: string;
    description: string;
}

export interface Currencies2 {
    type: string;
    description: string;
    items: Items443;
}

export interface Items443 {
    $ref: string;
}

export interface StoreCurrencyResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties488;
}

export interface Properties488 {
    currency: Currency5;
}

export interface Currency5 {
    $ref: string;
}

export interface StoreCustomer {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties489;
}

export interface Properties489 {
    id: Id207;
    email: Email16;
    default_billing_address_id: DefaultBillingAddressId3;
    default_shipping_address_id: DefaultShippingAddressId3;
    company_name: CompanyName4;
    first_name: FirstName20;
    last_name: LastName20;
    addresses: Addresses2;
    phone: Phone20;
    metadata: Metadata150;
    created_at: CreatedAt131;
    updated_at: UpdatedAt125;
    deleted_at: DeletedAt60;
}

export interface Id207 {
    type: string;
    title: string;
    description: string;
}

export interface Email16 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DefaultBillingAddressId3 {
    type: string;
    title: string;
    description: string;
}

export interface DefaultShippingAddressId3 {
    type: string;
    title: string;
    description: string;
}

export interface CompanyName4 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName20 {
    type: string;
    title: string;
    description: string;
}

export interface LastName20 {
    type: string;
    title: string;
    description: string;
}

export interface Addresses2 {
    type: string;
    description: string;
    items: Items444;
}

export interface Items444 {
    $ref: string;
}

export interface Phone20 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata150 {
    type: string;
    description: string;
}

export interface CreatedAt131 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt125 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt60 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface StoreCustomerAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties490;
}

export interface Properties490 {
    id: Id208;
    address_name: AddressName4;
    is_default_shipping: IsDefaultShipping4;
    is_default_billing: IsDefaultBilling4;
    customer_id: CustomerId15;
    company: Company18;
    first_name: FirstName21;
    last_name: LastName21;
    address_1: Address118;
    address_2: Address218;
    city: City19;
    country_code: CountryCode21;
    province: Province18;
    postal_code: PostalCode18;
    phone: Phone21;
    metadata: Metadata151;
    created_at: CreatedAt132;
    updated_at: UpdatedAt126;
}

export interface Id208 {
    type: string;
    title: string;
    description: string;
}

export interface AddressName4 {
    type: string;
    title: string;
    description: string;
}

export interface IsDefaultShipping4 {
    type: string;
    title: string;
    description: string;
}

export interface IsDefaultBilling4 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId15 {
    type: string;
    title: string;
    description: string;
}

export interface Company18 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName21 {
    type: string;
    title: string;
    description: string;
}

export interface LastName21 {
    type: string;
    title: string;
    description: string;
}

export interface Address118 {
    type: string;
    title: string;
    description: string;
}

export interface Address218 {
    type: string;
    title: string;
    description: string;
}

export interface City19 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode21 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Province18 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode18 {
    type: string;
    title: string;
    description: string;
}

export interface Phone21 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata151 {
    type: string;
    description: string;
}

export interface CreatedAt132 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt126 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface StoreCustomerAddressListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties491;
}

export interface Properties491 {
    limit: Limit26;
    offset: Offset24;
    count: Count24;
    addresses: Addresses3;
}

export interface Limit26 {
    type: string;
    title: string;
    description: string;
}

export interface Offset24 {
    type: string;
    title: string;
    description: string;
}

export interface Count24 {
    type: string;
    title: string;
    description: string;
}

export interface Addresses3 {
    type: string;
    description: string;
    items: Items445;
}

export interface Items445 {
    $ref: string;
}

export interface StoreCustomerAddressResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties492;
}

export interface Properties492 {
    address: Address6;
}

export interface Address6 {
    $ref: string;
}

export interface StoreCustomerResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties493;
}

export interface Properties493 {
    customer: Customer7;
}

export interface Customer7 {
    $ref: string;
}

export interface StoreDeclineOrderTransferRequest {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties494;
}

export interface Properties494 {
    token: Token6;
}

export interface Token6 {
    type: string;
    title: string;
    description: string;
}

export interface StoreInitializePaymentSession {
    "type": string;
    "description": string;
    "required": string[];
    "properties": Properties495;
    "x-schemaName": string;
}

export interface Properties495 {
    provider_id: ProviderId29;
    data: Data21;
}

export interface ProviderId29 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Data21 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs111 {
    url: string;
    description: string;
}

export interface StoreOrder {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties496;
}

export interface Properties496 {
    id: Id209;
    region_id: RegionId11;
    customer_id: CustomerId16;
    sales_channel_id: SalesChannelId9;
    email: Email17;
    currency_code: CurrencyCode34;
    display_id: DisplayId12;
    shipping_address: ShippingAddress11;
    billing_address: BillingAddress11;
    items: Items446;
    shipping_methods: ShippingMethods13;
    payment_collections: PaymentCollections5;
    payment_status: PaymentStatus5;
    fulfillments: Fulfillments5;
    fulfillment_status: FulfillmentStatus5;
    summary: Summary7;
    metadata: Metadata152;
    created_at: CreatedAt133;
    updated_at: UpdatedAt127;
    original_item_total: OriginalItemTotal8;
    original_item_subtotal: OriginalItemSubtotal8;
    original_item_tax_total: OriginalItemTaxTotal8;
    item_total: ItemTotal14;
    item_subtotal: ItemSubtotal14;
    item_tax_total: ItemTaxTotal14;
    original_total: OriginalTotal20;
    original_subtotal: OriginalSubtotal20;
    original_tax_total: OriginalTaxTotal20;
    total: Total28;
    subtotal: Subtotal28;
    tax_total: TaxTotal20;
    discount_total: DiscountTotal20;
    discount_tax_total: DiscountTaxTotal20;
    gift_card_total: GiftCardTotal8;
    gift_card_tax_total: GiftCardTaxTotal8;
    shipping_total: ShippingTotal8;
    shipping_subtotal: ShippingSubtotal8;
    shipping_tax_total: ShippingTaxTotal8;
    original_shipping_total: OriginalShippingTotal8;
    original_shipping_subtotal: OriginalShippingSubtotal8;
    original_shipping_tax_total: OriginalShippingTaxTotal8;
    customer: Customer8;
    transactions: Transactions11;
    status: Status25;
}

export interface Id209 {
    type: string;
    title: string;
    description: string;
}

export interface RegionId11 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId16 {
    type: string;
    title: string;
    description: string;
}

export interface SalesChannelId9 {
    type: string;
    title: string;
    description: string;
}

export interface Email17 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CurrencyCode34 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface DisplayId12 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingAddress11 {
    $ref: string;
}

export interface BillingAddress11 {
    $ref: string;
}

export interface Items446 {
    type: string;
    description: string;
    items: Items447;
}

export interface Items447 {
    $ref: string;
}

export interface ShippingMethods13 {
    type: string;
    description: string;
    items: Items448;
}

export interface Items448 {
    $ref: string;
}

export interface PaymentCollections5 {
    type: string;
    description: string;
    items: Items449;
}

export interface Items449 {
    $ref: string;
}

export interface PaymentStatus5 {
    type: string;
    description: string;
    enum: string[];
}

export interface Fulfillments5 {
    type: string;
    description: string;
    items: Items450;
}

export interface Items450 {
    $ref: string;
}

export interface FulfillmentStatus5 {
    type: string;
    description: string;
    enum: string[];
}

export interface Summary7 {
    $ref: string;
}

export interface Metadata152 {
    type: string;
    description: string;
}

export interface CreatedAt133 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt127 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalItemTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemSubtotal8 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalItemTaxTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal14 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal14 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal14 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTotal20 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal20 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal20 {
    type: string;
    title: string;
    description: string;
}

export interface Total28 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal28 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal20 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal20 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal20 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface GiftCardTaxTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingSubtotal8 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingTaxTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingSubtotal8 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalShippingTaxTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface Customer8 {
    $ref: string;
}

export interface Transactions11 {
    type: string;
    description: string;
    items: Items451;
}

export interface Items451 {
    $ref: string;
}

export interface Status25 {
    type: string;
    title: string;
    description: string;
}

export interface StoreOrderAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties497;
}

export interface Properties497 {
    id: Id210;
    customer_id: CustomerId17;
    first_name: FirstName22;
    last_name: LastName22;
    phone: Phone22;
    company: Company19;
    address_1: Address119;
    address_2: Address219;
    city: City20;
    country_code: CountryCode22;
    country: Country2;
    province: Province19;
    postal_code: PostalCode19;
    metadata: Metadata153;
    created_at: CreatedAt134;
    updated_at: UpdatedAt128;
}

export interface Id210 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId17 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName22 {
    type: string;
    title: string;
    description: string;
}

export interface LastName22 {
    type: string;
    title: string;
    description: string;
}

export interface Phone22 {
    type: string;
    title: string;
    description: string;
}

export interface Company19 {
    type: string;
    title: string;
    description: string;
}

export interface Address119 {
    type: string;
    title: string;
    description: string;
}

export interface Address219 {
    type: string;
    title: string;
    description: string;
}

export interface City20 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode22 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Country2 {
    $ref: string;
}

export interface Province19 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode19 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata153 {
    type: string;
    description: string;
}

export interface CreatedAt134 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt128 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface StoreOrderFulfillment {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties498;
}

export interface Properties498 {
    id: Id211;
    location_id: LocationId18;
    packed_at: PackedAt5;
    shipped_at: ShippedAt5;
    delivered_at: DeliveredAt5;
    canceled_at: CanceledAt16;
    data: Data22;
    provider_id: ProviderId30;
    shipping_option_id: ShippingOptionId17;
    metadata: Metadata154;
    created_at: CreatedAt135;
    updated_at: UpdatedAt129;
    requires_shipping: RequiresShipping11;
}

export interface Id211 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId18 {
    type: string;
    title: string;
    description: string;
}

export interface PackedAt5 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface ShippedAt5 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface DeliveredAt5 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CanceledAt16 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface Data22 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs112 {
    url: string;
}

export interface ProviderId30 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId17 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata154 {
    type: string;
    description: string;
}

export interface CreatedAt135 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt129 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface RequiresShipping11 {
    type: string;
    title: string;
    description: string;
}

export interface StoreOrderLineItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties499;
}

export interface Properties499 {
    id: Id212;
    title: Title40;
    subtitle: Subtitle12;
    thumbnail: Thumbnail14;
    variant: Variant8;
    variant_id: VariantId18;
    product: Product12;
    product_id: ProductId11;
    product_title: ProductTitle7;
    product_description: ProductDescription7;
    product_subtitle: ProductSubtitle7;
    product_type: ProductType8;
    product_collection: ProductCollection7;
    product_handle: ProductHandle7;
    variant_sku: VariantSku7;
    variant_barcode: VariantBarcode7;
    variant_title: VariantTitle7;
    variant_option_values: VariantOptionValues7;
    requires_shipping: RequiresShipping12;
    is_discountable: IsDiscountable7;
    is_tax_inclusive: IsTaxInclusive18;
    compare_at_unit_price: CompareAtUnitPrice10;
    unit_price: UnitPrice12;
    quantity: Quantity34;
    tax_lines: TaxLines13;
    adjustments: Adjustments14;
    detail: Detail9;
    created_at: CreatedAt162;
    updated_at: UpdatedAt156;
    metadata: Metadata169;
    original_total: OriginalTotal24;
    original_subtotal: OriginalSubtotal24;
    original_tax_total: OriginalTaxTotal24;
    item_total: ItemTotal18;
    item_subtotal: ItemSubtotal18;
    item_tax_total: ItemTaxTotal18;
    total: Total38;
    subtotal: Subtotal38;
    tax_total: TaxTotal24;
    discount_total: DiscountTotal24;
    discount_tax_total: DiscountTaxTotal24;
    refundable_total: RefundableTotal8;
    refundable_total_per_unit: RefundableTotalPerUnit8;
    product_type_id: ProductTypeId4;
}

export interface Id212 {
    type: string;
    title: string;
    description: string;
}

export interface Title40 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle12 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail14 {
    type: string;
    title: string;
    description: string;
}

export interface Variant8 {
    $ref: string;
}

export interface VariantId18 {
    type: string;
    title: string;
    description: string;
}

export interface Product12 {
    $ref: string;
}

export interface ProductId11 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTitle7 {
    type: string;
    title: string;
    description: string;
}

export interface ProductDescription7 {
    type: string;
    title: string;
    description: string;
}

export interface ProductSubtitle7 {
    type: string;
    title: string;
    description: string;
}

export interface ProductType8 {
    type: string;
    title: string;
    description: string;
}

export interface ProductCollection7 {
    type: string;
    title: string;
    description: string;
}

export interface ProductHandle7 {
    type: string;
    title: string;
    description: string;
}

export interface VariantSku7 {
    type: string;
    title: string;
    description: string;
}

export interface VariantBarcode7 {
    type: string;
    title: string;
    description: string;
}

export interface VariantTitle7 {
    type: string;
    title: string;
    description: string;
}

export interface VariantOptionValues7 {
    type: string;
    description: string;
    example: Example16;
}

export interface Example16 {
    Color: string;
}

export interface RequiresShipping12 {
    type: string;
    title: string;
    description: string;
}

export interface IsDiscountable7 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive18 {
    type: string;
    title: string;
    description: string;
}

export interface CompareAtUnitPrice10 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice12 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity34 {
    type: string;
    title: string;
    description: string;
}

export interface TaxLines13 {
    type: string;
    description: string;
    items: Items452;
}

export interface Items452 {
    allOf: AllOf17[];
    description: string;
}

export interface AllOf17 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties500;
}

export interface Properties500 {
    item: Item12;
    item_id?: ItemId22;
    total?: Total32;
    subtotal?: Subtotal32;
    id?: Id222;
    description?: Description74;
    tax_rate_id?: TaxRateId11;
    code?: Code33;
    rate?: Rate15;
    provider_id?: ProviderId35;
    created_at?: CreatedAt145;
    updated_at?: UpdatedAt139;
}

export interface Item12 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties501;
}

export interface Properties501 {
    id: Id213;
    title: Title41;
    subtitle: Subtitle13;
    thumbnail: Thumbnail15;
    variant: Variant9;
    variant_id: VariantId19;
    product: Product14;
    product_id: ProductId13;
    product_title: ProductTitle8;
    product_description: ProductDescription8;
    product_subtitle: ProductSubtitle8;
    product_type: ProductType9;
    product_collection: ProductCollection8;
    product_handle: ProductHandle8;
    variant_sku: VariantSku8;
    variant_barcode: VariantBarcode8;
    variant_title: VariantTitle8;
    variant_option_values: VariantOptionValues8;
    requires_shipping: RequiresShipping13;
    is_discountable: IsDiscountable8;
    is_tax_inclusive: IsTaxInclusive19;
    compare_at_unit_price: CompareAtUnitPrice11;
    unit_price: UnitPrice13;
    quantity: Quantity35;
    tax_lines: TaxLines14;
    adjustments: Adjustments13;
    detail: Detail7;
    created_at: CreatedAt144;
    updated_at: UpdatedAt138;
    metadata: Metadata159;
    original_total: OriginalTotal21;
    original_subtotal: OriginalSubtotal21;
    original_tax_total: OriginalTaxTotal21;
    item_total: ItemTotal15;
    item_subtotal: ItemSubtotal15;
    item_tax_total: ItemTaxTotal15;
    total: Total31;
    subtotal: Subtotal31;
    tax_total: TaxTotal21;
    discount_total: DiscountTotal21;
    discount_tax_total: DiscountTaxTotal21;
    refundable_total: RefundableTotal5;
    refundable_total_per_unit: RefundableTotalPerUnit5;
}

export interface Id213 {
    type: string;
    title: string;
    description: string;
}

export interface Title41 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle13 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail15 {
    type: string;
    title: string;
    description: string;
}

export interface Variant9 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties502;
}

export interface Properties502 {
    id: Id214;
    title: Title42;
    sku: Sku10;
    barcode: Barcode8;
    ean: Ean6;
    upc: Upc6;
    allow_backorder: AllowBackorder10;
    manage_inventory: ManageInventory6;
    inventory_quantity: InventoryQuantity3;
    hs_code: HsCode13;
    origin_country: OriginCountry13;
    mid_code: MidCode13;
    material: Material13;
    weight: Weight13;
    length: Length13;
    height: Height13;
    width: Width13;
    variant_rank: VariantRank6;
    options: Options12;
    product: Product13;
    product_id: ProductId12;
    calculated_price: CalculatedPrice6;
    created_at: CreatedAt136;
    updated_at: UpdatedAt130;
    deleted_at: DeletedAt61;
    metadata: Metadata155;
}

export interface Id214 {
    type: string;
    title: string;
    description: string;
}

export interface Title42 {
    type: string;
    title: string;
    description: string;
}

export interface Sku10 {
    type: string;
    title: string;
    description: string;
}

export interface Barcode8 {
    type: string;
    title: string;
    description: string;
}

export interface Ean6 {
    type: string;
    title: string;
    description: string;
}

export interface Upc6 {
    type: string;
    title: string;
    description: string;
}

export interface AllowBackorder10 {
    type: string;
    title: string;
    description: string;
}

export interface ManageInventory6 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode13 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry13 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode13 {
    type: string;
    title: string;
    description: string;
}

export interface Material13 {
    type: string;
    title: string;
    description: string;
}

export interface Weight13 {
    type: string;
    title: string;
    description: string;
}

export interface Length13 {
    type: string;
    title: string;
    description: string;
}

export interface Height13 {
    type: string;
    title: string;
    description: string;
}

export interface Width13 {
    type: string;
    title: string;
    description: string;
}

export interface VariantRank6 {
    type: string;
    title: string;
    description: string;
}

export interface Options12 {
    type: string;
    description: string;
    items: Items453;
}

export interface Items453 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Product13 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ProductId12 {
    type: string;
    title: string;
    description: string;
}

export interface CalculatedPrice6 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface CreatedAt136 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt130 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt61 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata155 {
    type: string;
    description: string;
}

export interface VariantId19 {
    type: string;
    title: string;
    description: string;
}

export interface Product14 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties503;
}

export interface Properties503 {
    id: Id215;
    title: Title43;
    handle: Handle14;
    subtitle: Subtitle14;
    description: Description69;
    is_giftcard: IsGiftcard6;
    status: Status26;
    thumbnail: Thumbnail16;
    width: Width14;
    weight: Weight14;
    length: Length14;
    height: Height14;
    origin_country: OriginCountry14;
    hs_code: HsCode14;
    mid_code: MidCode14;
    material: Material14;
    collection: Collection5;
    collection_id: CollectionId6;
    categories: Categories6;
    type: Type27;
    type_id: TypeId6;
    tags: Tags6;
    variants: Variants6;
    options: Options13;
    images: Images6;
    discountable: Discountable6;
    external_id: ExternalId8;
    created_at: CreatedAt137;
    updated_at: UpdatedAt131;
    deleted_at: DeletedAt62;
    metadata: Metadata156;
}

export interface Id215 {
    type: string;
    title: string;
    description: string;
}

export interface Title43 {
    type: string;
    title: string;
    description: string;
}

export interface Handle14 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle14 {
    type: string;
    title: string;
    description: string;
}

export interface Description69 {
    type: string;
    title: string;
    description: string;
}

export interface IsGiftcard6 {
    type: string;
    title: string;
    description: string;
}

export interface Status26 {
    type: string;
    description: string;
    enum: string[];
}

export interface Thumbnail16 {
    type: string;
    title: string;
    description: string;
}

export interface Width14 {
    type: string;
    title: string;
    description: string;
}

export interface Weight14 {
    type: string;
    title: string;
    description: string;
}

export interface Length14 {
    type: string;
    title: string;
    description: string;
}

export interface Height14 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry14 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode14 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode14 {
    type: string;
    title: string;
    description: string;
}

export interface Material14 {
    type: string;
    title: string;
    description: string;
}

export interface Collection5 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface CollectionId6 {
    type: string;
    title: string;
    description: string;
}

export interface Categories6 {
    type: string;
    description: string;
    items: Items454;
}

export interface Items454 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Type27 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface TypeId6 {
    type: string;
    title: string;
    description: string;
}

export interface Tags6 {
    type: string;
    description: string;
    items: Items455;
}

export interface Items455 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Variants6 {
    type: string;
    description: string;
    items: Items456;
}

export interface Items456 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Options13 {
    type: string;
    description: string;
    items: Items457;
}

export interface Items457 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Images6 {
    type: string;
    description: string;
    items: Items458;
}

export interface Items458 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Discountable6 {
    type: string;
    title: string;
    description: string;
}

export interface ExternalId8 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt137 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt131 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt62 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata156 {
    type: string;
    description: string;
}

export interface ProductId13 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTitle8 {
    type: string;
    title: string;
    description: string;
}

export interface ProductDescription8 {
    type: string;
    title: string;
    description: string;
}

export interface ProductSubtitle8 {
    type: string;
    title: string;
    description: string;
}

export interface ProductType9 {
    type: string;
    title: string;
    description: string;
}

export interface ProductCollection8 {
    type: string;
    title: string;
    description: string;
}

export interface ProductHandle8 {
    type: string;
    title: string;
    description: string;
}

export interface VariantSku8 {
    type: string;
    title: string;
    description: string;
}

export interface VariantBarcode8 {
    type: string;
    title: string;
    description: string;
}

export interface VariantTitle8 {
    type: string;
    title: string;
    description: string;
}

export interface VariantOptionValues8 {
    type: string;
    description: string;
}

export interface RequiresShipping13 {
    type: string;
    title: string;
    description: string;
}

export interface IsDiscountable8 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive19 {
    type: string;
    title: string;
    description: string;
}

export interface CompareAtUnitPrice11 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice13 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity35 {
    type: string;
    title: string;
    description: string;
}

export interface TaxLines14 {
    type: string;
    description: string;
    items: Items459;
}

export interface Items459 {
    "type"?: string;
    "description"?: string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties"?: Properties504;
    "allOf"?: AllOf18[];
}

export interface Properties504 {
    item: Item13;
    item_id: ItemId16;
    total: Total29;
    subtotal: Subtotal29;
    id: Id216;
    description: Description70;
    tax_rate_id: TaxRateId9;
    code: Code29;
    rate: Rate13;
    provider_id: ProviderId31;
    created_at: CreatedAt138;
    updated_at: UpdatedAt132;
}

export interface Item13 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ItemId16 {
    type: string;
    title: string;
    description: string;
}

export interface Total29 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal29 {
    type: string;
    title: string;
    description: string;
}

export interface Id216 {
    type: string;
    title: string;
    description: string;
}

export interface Description70 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId9 {
    type: string;
    title: string;
    description: string;
}

export interface Code29 {
    type: string;
    title: string;
    description: string;
}

export interface Rate13 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId31 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt138 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt132 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AllOf18 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties505;
}

export interface Properties505 {
    item: Item14;
    item_id?: ItemId17;
    total?: Total30;
    subtotal?: Subtotal30;
    id?: Id217;
    description?: Description71;
    tax_rate_id?: TaxRateId10;
    code?: Code30;
    rate?: Rate14;
    provider_id?: ProviderId32;
    created_at?: CreatedAt139;
    updated_at?: UpdatedAt133;
}

export interface Item14 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ItemId17 {
    type: string;
    title: string;
    description: string;
}

export interface Total30 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal30 {
    type: string;
    title: string;
    description: string;
}

export interface Id217 {
    type: string;
    title: string;
    description: string;
}

export interface Description71 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId10 {
    type: string;
    title: string;
    description: string;
}

export interface Code30 {
    type: string;
    title: string;
    description: string;
}

export interface Rate14 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId32 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt139 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt133 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Adjustments13 {
    type: string;
    description: string;
    items: Items460;
}

export interface Items460 {
    "type"?: string;
    "description"?: string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties"?: Properties506;
    "allOf"?: AllOf19[];
}

export interface Properties506 {
    item: Item15;
    item_id: ItemId18;
    id: Id218;
    code: Code31;
    amount: Amount34;
    order_id: OrderId32;
    description: Description72;
    promotion_id: PromotionId9;
    provider_id: ProviderId33;
    created_at: CreatedAt140;
    updated_at: UpdatedAt134;
}

export interface Item15 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ItemId18 {
    type: string;
    title: string;
    description: string;
}

export interface Id218 {
    type: string;
    title: string;
    description: string;
}

export interface Code31 {
    type: string;
    title: string;
    description: string;
}

export interface Amount34 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId32 {
    type: string;
    title: string;
    description: string;
}

export interface Description72 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId9 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId33 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt140 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt134 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AllOf19 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties507;
}

export interface Properties507 {
    item: Item16;
    item_id?: ItemId19;
    id?: Id219;
    code?: Code32;
    amount?: Amount35;
    order_id?: OrderId33;
    description?: Description73;
    promotion_id?: PromotionId10;
    provider_id?: ProviderId34;
    created_at?: CreatedAt141;
    updated_at?: UpdatedAt135;
}

export interface Item16 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ItemId19 {
    type: string;
    title: string;
    description: string;
}

export interface Id219 {
    type: string;
    title: string;
    description: string;
}

export interface Code32 {
    type: string;
    title: string;
    description: string;
}

export interface Amount35 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId33 {
    type: string;
    title: string;
    description: string;
}

export interface Description73 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId10 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId34 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt141 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt135 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Detail7 {
    "type"?: string;
    "description"?: string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties"?: Properties508;
    "allOf"?: AllOf20[];
}

export interface Properties508 {
    id: Id220;
    item_id: ItemId20;
    item: Item17;
    quantity: Quantity36;
    fulfilled_quantity: FulfilledQuantity3;
    delivered_quantity: DeliveredQuantity3;
    shipped_quantity: ShippedQuantity3;
    return_requested_quantity: ReturnRequestedQuantity3;
    return_received_quantity: ReturnReceivedQuantity3;
    return_dismissed_quantity: ReturnDismissedQuantity3;
    written_off_quantity: WrittenOffQuantity3;
    metadata: Metadata157;
    created_at: CreatedAt142;
    updated_at: UpdatedAt136;
}

export interface Id220 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId20 {
    type: string;
    title: string;
    description: string;
}

export interface Item17 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Quantity36 {
    type: string;
    title: string;
    description: string;
}

export interface FulfilledQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface DeliveredQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface ShippedQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnRequestedQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnReceivedQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnDismissedQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface WrittenOffQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata157 {
    type: string;
    description: string;
}

export interface CreatedAt142 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt136 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AllOf20 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties509;
}

export interface Properties509 {
    id?: Id221;
    item_id?: ItemId21;
    item: Item18;
    quantity?: Quantity37;
    fulfilled_quantity?: FulfilledQuantity4;
    delivered_quantity?: DeliveredQuantity4;
    shipped_quantity?: ShippedQuantity4;
    return_requested_quantity?: ReturnRequestedQuantity4;
    return_received_quantity?: ReturnReceivedQuantity4;
    return_dismissed_quantity?: ReturnDismissedQuantity4;
    written_off_quantity?: WrittenOffQuantity4;
    metadata?: Metadata158;
    created_at?: CreatedAt143;
    updated_at?: UpdatedAt137;
}

export interface Id221 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId21 {
    type: string;
    title: string;
    description: string;
}

export interface Item18 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Quantity37 {
    type: string;
    title: string;
    description: string;
}

export interface FulfilledQuantity4 {
    type: string;
    title: string;
    description: string;
}

export interface DeliveredQuantity4 {
    type: string;
    title: string;
    description: string;
}

export interface ShippedQuantity4 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnRequestedQuantity4 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnReceivedQuantity4 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnDismissedQuantity4 {
    type: string;
    title: string;
    description: string;
}

export interface WrittenOffQuantity4 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata158 {
    type: string;
    description: string;
}

export interface CreatedAt143 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt137 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedAt144 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt138 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata159 {
    type: string;
    description: string;
}

export interface OriginalTotal21 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal21 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal21 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal15 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal15 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal15 {
    type: string;
    title: string;
    description: string;
}

export interface Total31 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal31 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal21 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal21 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal21 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotal5 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotalPerUnit5 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId22 {
    type: string;
    title: string;
    description: string;
}

export interface Total32 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal32 {
    type: string;
    title: string;
    description: string;
}

export interface Id222 {
    type: string;
    title: string;
    description: string;
}

export interface Description74 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId11 {
    type: string;
    title: string;
    description: string;
}

export interface Code33 {
    type: string;
    title: string;
    description: string;
}

export interface Rate15 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId35 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt145 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt139 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Adjustments14 {
    type: string;
    description: string;
    items: Items461;
}

export interface Items461 {
    allOf: AllOf21[];
    description: string;
}

export interface AllOf21 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties510;
}

export interface Properties510 {
    item: Item19;
    item_id?: ItemId29;
    id?: Id232;
    code?: Code38;
    amount?: Amount38;
    order_id?: OrderId36;
    description?: Description80;
    promotion_id?: PromotionId13;
    provider_id?: ProviderId40;
    created_at?: CreatedAt155;
    updated_at?: UpdatedAt149;
}

export interface Item19 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties511;
}

export interface Properties511 {
    id: Id223;
    title: Title44;
    subtitle: Subtitle15;
    thumbnail: Thumbnail17;
    variant: Variant10;
    variant_id: VariantId20;
    product: Product16;
    product_id: ProductId15;
    product_title: ProductTitle9;
    product_description: ProductDescription9;
    product_subtitle: ProductSubtitle9;
    product_type: ProductType10;
    product_collection: ProductCollection9;
    product_handle: ProductHandle9;
    variant_sku: VariantSku9;
    variant_barcode: VariantBarcode9;
    variant_title: VariantTitle9;
    variant_option_values: VariantOptionValues9;
    requires_shipping: RequiresShipping14;
    is_discountable: IsDiscountable9;
    is_tax_inclusive: IsTaxInclusive20;
    compare_at_unit_price: CompareAtUnitPrice12;
    unit_price: UnitPrice14;
    quantity: Quantity38;
    tax_lines: TaxLines15;
    adjustments: Adjustments15;
    detail: Detail8;
    created_at: CreatedAt154;
    updated_at: UpdatedAt148;
    metadata: Metadata164;
    original_total: OriginalTotal22;
    original_subtotal: OriginalSubtotal22;
    original_tax_total: OriginalTaxTotal22;
    item_total: ItemTotal16;
    item_subtotal: ItemSubtotal16;
    item_tax_total: ItemTaxTotal16;
    total: Total35;
    subtotal: Subtotal35;
    tax_total: TaxTotal22;
    discount_total: DiscountTotal22;
    discount_tax_total: DiscountTaxTotal22;
    refundable_total: RefundableTotal6;
    refundable_total_per_unit: RefundableTotalPerUnit6;
}

export interface Id223 {
    type: string;
    title: string;
    description: string;
}

export interface Title44 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle15 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail17 {
    type: string;
    title: string;
    description: string;
}

export interface Variant10 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties512;
}

export interface Properties512 {
    id: Id224;
    title: Title45;
    sku: Sku11;
    barcode: Barcode9;
    ean: Ean7;
    upc: Upc7;
    allow_backorder: AllowBackorder11;
    manage_inventory: ManageInventory7;
    inventory_quantity: InventoryQuantity4;
    hs_code: HsCode15;
    origin_country: OriginCountry15;
    mid_code: MidCode15;
    material: Material15;
    weight: Weight15;
    length: Length15;
    height: Height15;
    width: Width15;
    variant_rank: VariantRank7;
    options: Options14;
    product: Product15;
    product_id: ProductId14;
    calculated_price: CalculatedPrice7;
    created_at: CreatedAt146;
    updated_at: UpdatedAt140;
    deleted_at: DeletedAt63;
    metadata: Metadata160;
}

export interface Id224 {
    type: string;
    title: string;
    description: string;
}

export interface Title45 {
    type: string;
    title: string;
    description: string;
}

export interface Sku11 {
    type: string;
    title: string;
    description: string;
}

export interface Barcode9 {
    type: string;
    title: string;
    description: string;
}

export interface Ean7 {
    type: string;
    title: string;
    description: string;
}

export interface Upc7 {
    type: string;
    title: string;
    description: string;
}

export interface AllowBackorder11 {
    type: string;
    title: string;
    description: string;
}

export interface ManageInventory7 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryQuantity4 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode15 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry15 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode15 {
    type: string;
    title: string;
    description: string;
}

export interface Material15 {
    type: string;
    title: string;
    description: string;
}

export interface Weight15 {
    type: string;
    title: string;
    description: string;
}

export interface Length15 {
    type: string;
    title: string;
    description: string;
}

export interface Height15 {
    type: string;
    title: string;
    description: string;
}

export interface Width15 {
    type: string;
    title: string;
    description: string;
}

export interface VariantRank7 {
    type: string;
    title: string;
    description: string;
}

export interface Options14 {
    type: string;
    description: string;
    items: Items462;
}

export interface Items462 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Product15 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ProductId14 {
    type: string;
    title: string;
    description: string;
}

export interface CalculatedPrice7 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface CreatedAt146 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt140 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt63 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata160 {
    type: string;
    description: string;
}

export interface VariantId20 {
    type: string;
    title: string;
    description: string;
}

export interface Product16 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties513;
}

export interface Properties513 {
    id: Id225;
    title: Title46;
    handle: Handle15;
    subtitle: Subtitle16;
    description: Description75;
    is_giftcard: IsGiftcard7;
    status: Status27;
    thumbnail: Thumbnail18;
    width: Width16;
    weight: Weight16;
    length: Length16;
    height: Height16;
    origin_country: OriginCountry16;
    hs_code: HsCode16;
    mid_code: MidCode16;
    material: Material16;
    collection: Collection6;
    collection_id: CollectionId7;
    categories: Categories7;
    type: Type28;
    type_id: TypeId7;
    tags: Tags7;
    variants: Variants7;
    options: Options15;
    images: Images7;
    discountable: Discountable7;
    external_id: ExternalId9;
    created_at: CreatedAt147;
    updated_at: UpdatedAt141;
    deleted_at: DeletedAt64;
    metadata: Metadata161;
}

export interface Id225 {
    type: string;
    title: string;
    description: string;
}

export interface Title46 {
    type: string;
    title: string;
    description: string;
}

export interface Handle15 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle16 {
    type: string;
    title: string;
    description: string;
}

export interface Description75 {
    type: string;
    title: string;
    description: string;
}

export interface IsGiftcard7 {
    type: string;
    title: string;
    description: string;
}

export interface Status27 {
    type: string;
    description: string;
    enum: string[];
}

export interface Thumbnail18 {
    type: string;
    title: string;
    description: string;
}

export interface Width16 {
    type: string;
    title: string;
    description: string;
}

export interface Weight16 {
    type: string;
    title: string;
    description: string;
}

export interface Length16 {
    type: string;
    title: string;
    description: string;
}

export interface Height16 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry16 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode16 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode16 {
    type: string;
    title: string;
    description: string;
}

export interface Material16 {
    type: string;
    title: string;
    description: string;
}

export interface Collection6 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface CollectionId7 {
    type: string;
    title: string;
    description: string;
}

export interface Categories7 {
    type: string;
    description: string;
    items: Items463;
}

export interface Items463 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Type28 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface TypeId7 {
    type: string;
    title: string;
    description: string;
}

export interface Tags7 {
    type: string;
    description: string;
    items: Items464;
}

export interface Items464 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Variants7 {
    type: string;
    description: string;
    items: Items465;
}

export interface Items465 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Options15 {
    type: string;
    description: string;
    items: Items466;
}

export interface Items466 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Images7 {
    type: string;
    description: string;
    items: Items467;
}

export interface Items467 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Discountable7 {
    type: string;
    title: string;
    description: string;
}

export interface ExternalId9 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt147 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt141 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt64 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata161 {
    type: string;
    description: string;
}

export interface ProductId15 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTitle9 {
    type: string;
    title: string;
    description: string;
}

export interface ProductDescription9 {
    type: string;
    title: string;
    description: string;
}

export interface ProductSubtitle9 {
    type: string;
    title: string;
    description: string;
}

export interface ProductType10 {
    type: string;
    title: string;
    description: string;
}

export interface ProductCollection9 {
    type: string;
    title: string;
    description: string;
}

export interface ProductHandle9 {
    type: string;
    title: string;
    description: string;
}

export interface VariantSku9 {
    type: string;
    title: string;
    description: string;
}

export interface VariantBarcode9 {
    type: string;
    title: string;
    description: string;
}

export interface VariantTitle9 {
    type: string;
    title: string;
    description: string;
}

export interface VariantOptionValues9 {
    type: string;
    description: string;
}

export interface RequiresShipping14 {
    type: string;
    title: string;
    description: string;
}

export interface IsDiscountable9 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive20 {
    type: string;
    title: string;
    description: string;
}

export interface CompareAtUnitPrice12 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice14 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity38 {
    type: string;
    title: string;
    description: string;
}

export interface TaxLines15 {
    type: string;
    description: string;
    items: Items468;
}

export interface Items468 {
    "type"?: string;
    "description"?: string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties"?: Properties514;
    "allOf"?: AllOf22[];
}

export interface Properties514 {
    item: Item20;
    item_id: ItemId23;
    total: Total33;
    subtotal: Subtotal33;
    id: Id226;
    description: Description76;
    tax_rate_id: TaxRateId12;
    code: Code34;
    rate: Rate16;
    provider_id: ProviderId36;
    created_at: CreatedAt148;
    updated_at: UpdatedAt142;
}

export interface Item20 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ItemId23 {
    type: string;
    title: string;
    description: string;
}

export interface Total33 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal33 {
    type: string;
    title: string;
    description: string;
}

export interface Id226 {
    type: string;
    title: string;
    description: string;
}

export interface Description76 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId12 {
    type: string;
    title: string;
    description: string;
}

export interface Code34 {
    type: string;
    title: string;
    description: string;
}

export interface Rate16 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId36 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt148 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt142 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AllOf22 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties515;
}

export interface Properties515 {
    item: Item21;
    item_id?: ItemId24;
    total?: Total34;
    subtotal?: Subtotal34;
    id?: Id227;
    description?: Description77;
    tax_rate_id?: TaxRateId13;
    code?: Code35;
    rate?: Rate17;
    provider_id?: ProviderId37;
    created_at?: CreatedAt149;
    updated_at?: UpdatedAt143;
}

export interface Item21 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ItemId24 {
    type: string;
    title: string;
    description: string;
}

export interface Total34 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal34 {
    type: string;
    title: string;
    description: string;
}

export interface Id227 {
    type: string;
    title: string;
    description: string;
}

export interface Description77 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId13 {
    type: string;
    title: string;
    description: string;
}

export interface Code35 {
    type: string;
    title: string;
    description: string;
}

export interface Rate17 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId37 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt149 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt143 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Adjustments15 {
    type: string;
    description: string;
    items: Items469;
}

export interface Items469 {
    "type"?: string;
    "description"?: string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties"?: Properties516;
    "allOf"?: AllOf23[];
}

export interface Properties516 {
    item: Item22;
    item_id: ItemId25;
    id: Id228;
    code: Code36;
    amount: Amount36;
    order_id: OrderId34;
    description: Description78;
    promotion_id: PromotionId11;
    provider_id: ProviderId38;
    created_at: CreatedAt150;
    updated_at: UpdatedAt144;
}

export interface Item22 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ItemId25 {
    type: string;
    title: string;
    description: string;
}

export interface Id228 {
    type: string;
    title: string;
    description: string;
}

export interface Code36 {
    type: string;
    title: string;
    description: string;
}

export interface Amount36 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId34 {
    type: string;
    title: string;
    description: string;
}

export interface Description78 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId11 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId38 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt150 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt144 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AllOf23 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties517;
}

export interface Properties517 {
    item: Item23;
    item_id?: ItemId26;
    id?: Id229;
    code?: Code37;
    amount?: Amount37;
    order_id?: OrderId35;
    description?: Description79;
    promotion_id?: PromotionId12;
    provider_id?: ProviderId39;
    created_at?: CreatedAt151;
    updated_at?: UpdatedAt145;
}

export interface Item23 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ItemId26 {
    type: string;
    title: string;
    description: string;
}

export interface Id229 {
    type: string;
    title: string;
    description: string;
}

export interface Code37 {
    type: string;
    title: string;
    description: string;
}

export interface Amount37 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId35 {
    type: string;
    title: string;
    description: string;
}

export interface Description79 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId12 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId39 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt151 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt145 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Detail8 {
    "type"?: string;
    "description"?: string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties"?: Properties518;
    "allOf"?: AllOf24[];
}

export interface Properties518 {
    id: Id230;
    item_id: ItemId27;
    item: Item24;
    quantity: Quantity39;
    fulfilled_quantity: FulfilledQuantity5;
    delivered_quantity: DeliveredQuantity5;
    shipped_quantity: ShippedQuantity5;
    return_requested_quantity: ReturnRequestedQuantity5;
    return_received_quantity: ReturnReceivedQuantity5;
    return_dismissed_quantity: ReturnDismissedQuantity5;
    written_off_quantity: WrittenOffQuantity5;
    metadata: Metadata162;
    created_at: CreatedAt152;
    updated_at: UpdatedAt146;
}

export interface Id230 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId27 {
    type: string;
    title: string;
    description: string;
}

export interface Item24 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Quantity39 {
    type: string;
    title: string;
    description: string;
}

export interface FulfilledQuantity5 {
    type: string;
    title: string;
    description: string;
}

export interface DeliveredQuantity5 {
    type: string;
    title: string;
    description: string;
}

export interface ShippedQuantity5 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnRequestedQuantity5 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnReceivedQuantity5 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnDismissedQuantity5 {
    type: string;
    title: string;
    description: string;
}

export interface WrittenOffQuantity5 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata162 {
    type: string;
    description: string;
}

export interface CreatedAt152 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt146 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AllOf24 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties519;
}

export interface Properties519 {
    id?: Id231;
    item_id?: ItemId28;
    item: Item25;
    quantity?: Quantity40;
    fulfilled_quantity?: FulfilledQuantity6;
    delivered_quantity?: DeliveredQuantity6;
    shipped_quantity?: ShippedQuantity6;
    return_requested_quantity?: ReturnRequestedQuantity6;
    return_received_quantity?: ReturnReceivedQuantity6;
    return_dismissed_quantity?: ReturnDismissedQuantity6;
    written_off_quantity?: WrittenOffQuantity6;
    metadata?: Metadata163;
    created_at?: CreatedAt153;
    updated_at?: UpdatedAt147;
}

export interface Id231 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId28 {
    type: string;
    title: string;
    description: string;
}

export interface Item25 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Quantity40 {
    type: string;
    title: string;
    description: string;
}

export interface FulfilledQuantity6 {
    type: string;
    title: string;
    description: string;
}

export interface DeliveredQuantity6 {
    type: string;
    title: string;
    description: string;
}

export interface ShippedQuantity6 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnRequestedQuantity6 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnReceivedQuantity6 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnDismissedQuantity6 {
    type: string;
    title: string;
    description: string;
}

export interface WrittenOffQuantity6 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata163 {
    type: string;
    description: string;
}

export interface CreatedAt153 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt147 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedAt154 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt148 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata164 {
    type: string;
    description: string;
}

export interface OriginalTotal22 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal22 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal22 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal16 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal16 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal16 {
    type: string;
    title: string;
    description: string;
}

export interface Total35 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal35 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal22 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal22 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal22 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotal6 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotalPerUnit6 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId29 {
    type: string;
    title: string;
    description: string;
}

export interface Id232 {
    type: string;
    title: string;
    description: string;
}

export interface Code38 {
    type: string;
    title: string;
    description: string;
}

export interface Amount38 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId36 {
    type: string;
    title: string;
    description: string;
}

export interface Description80 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId13 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId40 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt155 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt149 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Detail9 {
    allOf: AllOf25[];
    description: string;
}

export interface AllOf25 {
    $ref?: string;
    type?: string;
    description?: string;
    required?: string[];
    properties?: Properties520;
}

export interface Properties520 {
    item: Item26;
}

export interface Item26 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties521;
}

export interface Properties521 {
    variant: Variant11;
    product: Product18;
    tax_lines: TaxLines16;
    adjustments: Adjustments16;
    detail: Detail10;
    title: Title49;
    id: Id238;
    metadata: Metadata168;
    created_at: CreatedAt161;
    updated_at: UpdatedAt155;
    item_total: ItemTotal17;
    item_subtotal: ItemSubtotal17;
    item_tax_total: ItemTaxTotal17;
    original_total: OriginalTotal23;
    original_subtotal: OriginalSubtotal23;
    original_tax_total: OriginalTaxTotal23;
    total: Total37;
    subtotal: Subtotal37;
    tax_total: TaxTotal23;
    discount_total: DiscountTotal23;
    discount_tax_total: DiscountTaxTotal23;
    subtitle: Subtitle18;
    thumbnail: Thumbnail20;
    variant_id: VariantId21;
    product_id: ProductId17;
    product_title: ProductTitle10;
    product_description: ProductDescription10;
    product_subtitle: ProductSubtitle10;
    product_type: ProductType11;
    product_collection: ProductCollection10;
    product_handle: ProductHandle10;
    variant_sku: VariantSku10;
    variant_barcode: VariantBarcode10;
    variant_title: VariantTitle10;
    variant_option_values: VariantOptionValues10;
    requires_shipping: RequiresShipping15;
    is_discountable: IsDiscountable10;
    is_tax_inclusive: IsTaxInclusive21;
    compare_at_unit_price: CompareAtUnitPrice13;
    unit_price: UnitPrice15;
    quantity: Quantity42;
    refundable_total: RefundableTotal7;
    refundable_total_per_unit: RefundableTotalPerUnit7;
}

export interface Variant11 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties522;
}

export interface Properties522 {
    options: Options16;
    product: Product17;
    length: Length17;
    title: Title47;
    id: Id233;
    metadata: Metadata165;
    created_at: CreatedAt156;
    updated_at: UpdatedAt150;
    product_id: ProductId16;
    width: Width17;
    weight: Weight17;
    height: Height17;
    origin_country: OriginCountry17;
    hs_code: HsCode17;
    mid_code: MidCode17;
    material: Material17;
    deleted_at: DeletedAt65;
    sku: Sku12;
    barcode: Barcode10;
    ean: Ean8;
    upc: Upc8;
    allow_backorder: AllowBackorder12;
    manage_inventory: ManageInventory8;
    inventory_quantity: InventoryQuantity5;
    variant_rank: VariantRank8;
    calculated_price: CalculatedPrice8;
}

export interface Options16 {
    type: string;
    description: string;
    items: Items470;
}

export interface Items470 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Product17 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Length17 {
    type: string;
    title: string;
    description: string;
}

export interface Title47 {
    type: string;
    title: string;
    description: string;
}

export interface Id233 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata165 {
    type: string;
    description: string;
}

export interface CreatedAt156 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt150 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface ProductId16 {
    type: string;
    title: string;
    description: string;
}

export interface Width17 {
    type: string;
    title: string;
    description: string;
}

export interface Weight17 {
    type: string;
    title: string;
    description: string;
}

export interface Height17 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry17 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode17 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode17 {
    type: string;
    title: string;
    description: string;
}

export interface Material17 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt65 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Sku12 {
    type: string;
    title: string;
    description: string;
}

export interface Barcode10 {
    type: string;
    title: string;
    description: string;
}

export interface Ean8 {
    type: string;
    title: string;
    description: string;
}

export interface Upc8 {
    type: string;
    title: string;
    description: string;
}

export interface AllowBackorder12 {
    type: string;
    title: string;
    description: string;
}

export interface ManageInventory8 {
    type: string;
    title: string;
    description: string;
}

export interface InventoryQuantity5 {
    type: string;
    title: string;
    description: string;
}

export interface VariantRank8 {
    type: string;
    title: string;
    description: string;
}

export interface CalculatedPrice8 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Product18 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties523;
}

export interface Properties523 {
    collection: Collection7;
    categories: Categories8;
    variants: Variants8;
    type: Type29;
    tags: Tags8;
    options: Options17;
    images: Images8;
    length: Length18;
    title: Title48;
    status: Status28;
    description: Description81;
    id: Id234;
    metadata: Metadata166;
    created_at: CreatedAt157;
    updated_at: UpdatedAt151;
    subtitle: Subtitle17;
    thumbnail: Thumbnail19;
    handle: Handle16;
    is_giftcard: IsGiftcard8;
    width: Width18;
    weight: Weight18;
    height: Height18;
    origin_country: OriginCountry18;
    hs_code: HsCode18;
    mid_code: MidCode18;
    material: Material18;
    collection_id: CollectionId8;
    type_id: TypeId8;
    discountable: Discountable8;
    external_id: ExternalId10;
    deleted_at: DeletedAt66;
}

export interface Collection7 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Categories8 {
    type: string;
    description: string;
    items: Items471;
}

export interface Items471 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Variants8 {
    type: string;
    description: string;
    items: Items472;
}

export interface Items472 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Type29 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Tags8 {
    type: string;
    description: string;
    items: Items473;
}

export interface Items473 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Options17 {
    type: string;
    description: string;
    items: Items474;
}

export interface Items474 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Images8 {
    type: string;
    description: string;
    items: Items475;
}

export interface Items475 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Length18 {
    type: string;
    title: string;
    description: string;
}

export interface Title48 {
    type: string;
    title: string;
    description: string;
}

export interface Status28 {
    type: string;
    description: string;
    enum: string[];
}

export interface Description81 {
    type: string;
    title: string;
    description: string;
}

export interface Id234 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata166 {
    type: string;
    description: string;
}

export interface CreatedAt157 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt151 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Subtitle17 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail19 {
    type: string;
    title: string;
    description: string;
}

export interface Handle16 {
    type: string;
    title: string;
    description: string;
}

export interface IsGiftcard8 {
    type: string;
    title: string;
    description: string;
}

export interface Width18 {
    type: string;
    title: string;
    description: string;
}

export interface Weight18 {
    type: string;
    title: string;
    description: string;
}

export interface Height18 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry18 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode18 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode18 {
    type: string;
    title: string;
    description: string;
}

export interface Material18 {
    type: string;
    title: string;
    description: string;
}

export interface CollectionId8 {
    type: string;
    title: string;
    description: string;
}

export interface TypeId8 {
    type: string;
    title: string;
    description: string;
}

export interface Discountable8 {
    type: string;
    title: string;
    description: string;
}

export interface ExternalId10 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt66 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface TaxLines16 {
    type: string;
    description: string;
    items: Items476;
}

export interface Items476 {
    allOf: AllOf26[];
}

export interface AllOf26 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties524;
}

export interface Properties524 {
    item: Item27;
    item_id?: ItemId30;
    total?: Total36;
    subtotal?: Subtotal36;
    id?: Id235;
    description?: Description82;
    tax_rate_id?: TaxRateId14;
    code?: Code39;
    rate?: Rate18;
    provider_id?: ProviderId41;
    created_at?: CreatedAt158;
    updated_at?: UpdatedAt152;
}

export interface Item27 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ItemId30 {
    type: string;
    title: string;
    description: string;
}

export interface Total36 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal36 {
    type: string;
    title: string;
    description: string;
}

export interface Id235 {
    type: string;
    title: string;
    description: string;
}

export interface Description82 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId14 {
    type: string;
    title: string;
    description: string;
}

export interface Code39 {
    type: string;
    title: string;
    description: string;
}

export interface Rate18 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId41 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt158 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt152 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Adjustments16 {
    type: string;
    description: string;
    items: Items477;
}

export interface Items477 {
    allOf: AllOf27[];
}

export interface AllOf27 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties525;
}

export interface Properties525 {
    item: Item28;
    item_id?: ItemId31;
    id?: Id236;
    code?: Code40;
    amount?: Amount39;
    order_id?: OrderId37;
    description?: Description83;
    promotion_id?: PromotionId14;
    provider_id?: ProviderId42;
    created_at?: CreatedAt159;
    updated_at?: UpdatedAt153;
}

export interface Item28 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ItemId31 {
    type: string;
    title: string;
    description: string;
}

export interface Id236 {
    type: string;
    title: string;
    description: string;
}

export interface Code40 {
    type: string;
    title: string;
    description: string;
}

export interface Amount39 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId37 {
    type: string;
    title: string;
    description: string;
}

export interface Description83 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId14 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId42 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt159 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt153 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Detail10 {
    allOf: AllOf28[];
}

export interface AllOf28 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties526;
}

export interface Properties526 {
    id?: Id237;
    item_id?: ItemId32;
    item: Item29;
    quantity?: Quantity41;
    fulfilled_quantity?: FulfilledQuantity7;
    delivered_quantity?: DeliveredQuantity7;
    shipped_quantity?: ShippedQuantity7;
    return_requested_quantity?: ReturnRequestedQuantity7;
    return_received_quantity?: ReturnReceivedQuantity7;
    return_dismissed_quantity?: ReturnDismissedQuantity7;
    written_off_quantity?: WrittenOffQuantity7;
    metadata?: Metadata167;
    created_at?: CreatedAt160;
    updated_at?: UpdatedAt154;
}

export interface Id237 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId32 {
    type: string;
    title: string;
    description: string;
}

export interface Item29 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface Quantity41 {
    type: string;
    title: string;
    description: string;
}

export interface FulfilledQuantity7 {
    type: string;
    title: string;
    description: string;
}

export interface DeliveredQuantity7 {
    type: string;
    title: string;
    description: string;
}

export interface ShippedQuantity7 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnRequestedQuantity7 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnReceivedQuantity7 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnDismissedQuantity7 {
    type: string;
    title: string;
    description: string;
}

export interface WrittenOffQuantity7 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata167 {
    type: string;
    description: string;
}

export interface CreatedAt160 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt154 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Title49 {
    type: string;
    title: string;
    description: string;
}

export interface Id238 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata168 {
    type: string;
    description: string;
}

export interface CreatedAt161 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt155 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface ItemTotal17 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal17 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal17 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTotal23 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal23 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal23 {
    type: string;
    title: string;
    description: string;
}

export interface Total37 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal37 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal23 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal23 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal23 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle18 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail20 {
    type: string;
    title: string;
    description: string;
}

export interface VariantId21 {
    type: string;
    title: string;
    description: string;
}

export interface ProductId17 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTitle10 {
    type: string;
    title: string;
    description: string;
}

export interface ProductDescription10 {
    type: string;
    title: string;
    description: string;
}

export interface ProductSubtitle10 {
    type: string;
    title: string;
    description: string;
}

export interface ProductType11 {
    type: string;
    title: string;
    description: string;
}

export interface ProductCollection10 {
    type: string;
    title: string;
    description: string;
}

export interface ProductHandle10 {
    type: string;
    title: string;
    description: string;
}

export interface VariantSku10 {
    type: string;
    title: string;
    description: string;
}

export interface VariantBarcode10 {
    type: string;
    title: string;
    description: string;
}

export interface VariantTitle10 {
    type: string;
    title: string;
    description: string;
}

export interface VariantOptionValues10 {
    type: string;
    description: string;
}

export interface RequiresShipping15 {
    type: string;
    title: string;
    description: string;
}

export interface IsDiscountable10 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive21 {
    type: string;
    title: string;
    description: string;
}

export interface CompareAtUnitPrice13 {
    type: string;
    title: string;
    description: string;
}

export interface UnitPrice15 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity42 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotal7 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotalPerUnit7 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt162 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt156 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata169 {
    type: string;
    description: string;
}

export interface OriginalTotal24 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal24 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal24 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTotal18 {
    type: string;
    title: string;
    description: string;
}

export interface ItemSubtotal18 {
    type: string;
    title: string;
    description: string;
}

export interface ItemTaxTotal18 {
    type: string;
    title: string;
    description: string;
}

export interface Total38 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal38 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal24 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal24 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal24 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotal8 {
    type: string;
    title: string;
    description: string;
}

export interface RefundableTotalPerUnit8 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTypeId4 {
    type: string;
    title: string;
    description: string;
}

export interface StoreOrderResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties527;
}

export interface Properties527 {
    order: Order19;
}

export interface Order19 {
    $ref: string;
}

export interface StoreOrderShippingMethod {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties528;
}

export interface Properties528 {
    id: Id239;
    order_id: OrderId38;
    name: Name43;
    description: Description84;
    amount: Amount40;
    is_tax_inclusive: IsTaxInclusive22;
    shipping_option_id: ShippingOptionId18;
    data: Data23;
    metadata: Metadata170;
    tax_lines: TaxLines17;
    adjustments: Adjustments18;
    original_total: OriginalTotal27;
    original_subtotal: OriginalSubtotal27;
    original_tax_total: OriginalTaxTotal27;
    total: Total46;
    subtotal: Subtotal46;
    tax_total: TaxTotal27;
    discount_total: DiscountTotal27;
    discount_tax_total: DiscountTaxTotal27;
    created_at: CreatedAt179;
    updated_at: UpdatedAt173;
    detail: Detail13;
}

export interface Id239 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId38 {
    type: string;
    title: string;
    description: string;
}

export interface Name43 {
    type: string;
    title: string;
    description: string;
}

export interface Description84 {
    type: string;
    title: string;
    description: string;
}

export interface Amount40 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive22 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId18 {
    type: string;
    title: string;
    description: string;
}

export interface Data23 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs113 {
    url: string;
}

export interface Metadata170 {
    type: string;
    description: string;
}

export interface TaxLines17 {
    type: string;
    description: string;
    items: Items478;
}

export interface Items478 {
    allOf: AllOf29[];
    description: string;
}

export interface AllOf29 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties529;
}

export interface Properties529 {
    shipping_method: ShippingMethod10;
    shipping_method_id?: ShippingMethodId15;
    total?: Total42;
    subtotal?: Subtotal42;
    id?: Id247;
    description?: Description90;
    tax_rate_id?: TaxRateId17;
    code?: Code45;
    rate?: Rate21;
    provider_id?: ProviderId47;
    created_at?: CreatedAt170;
    updated_at?: UpdatedAt164;
}

export interface ShippingMethod10 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties530;
}

export interface Properties530 {
    id: Id240;
    order_id: OrderId39;
    name: Name44;
    description: Description85;
    amount: Amount41;
    is_tax_inclusive: IsTaxInclusive23;
    shipping_option_id: ShippingOptionId19;
    data: Data24;
    metadata: Metadata171;
    tax_lines: TaxLines18;
    adjustments: Adjustments17;
    original_total: OriginalTotal25;
    original_subtotal: OriginalSubtotal25;
    original_tax_total: OriginalTaxTotal25;
    total: Total41;
    detail: Detail11;
    subtotal: Subtotal41;
    tax_total: TaxTotal25;
    discount_total: DiscountTotal25;
    discount_tax_total: DiscountTaxTotal25;
    created_at: CreatedAt169;
    updated_at: UpdatedAt163;
}

export interface Id240 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId39 {
    type: string;
    title: string;
    description: string;
}

export interface Name44 {
    type: string;
    title: string;
    description: string;
}

export interface Description85 {
    type: string;
    title: string;
    description: string;
}

export interface Amount41 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive23 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId19 {
    type: string;
    title: string;
    description: string;
}

export interface Data24 {
    type: string;
    description: string;
}

export interface Metadata171 {
    type: string;
    description: string;
}

export interface TaxLines18 {
    type: string;
    description: string;
    items: Items479;
}

export interface Items479 {
    "type"?: string;
    "description"?: string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties"?: Properties531;
    "allOf"?: AllOf30[];
}

export interface Properties531 {
    shipping_method: ShippingMethod11;
    shipping_method_id: ShippingMethodId9;
    total: Total39;
    subtotal: Subtotal39;
    id: Id241;
    description: Description86;
    tax_rate_id: TaxRateId15;
    code: Code41;
    rate: Rate19;
    provider_id: ProviderId43;
    created_at: CreatedAt163;
    updated_at: UpdatedAt157;
}

export interface ShippingMethod11 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ShippingMethodId9 {
    type: string;
    title: string;
    description: string;
}

export interface Total39 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal39 {
    type: string;
    title: string;
    description: string;
}

export interface Id241 {
    type: string;
    title: string;
    description: string;
}

export interface Description86 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId15 {
    type: string;
    title: string;
    description: string;
}

export interface Code41 {
    type: string;
    title: string;
    description: string;
}

export interface Rate19 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId43 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt163 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt157 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AllOf30 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties532;
}

export interface Properties532 {
    shipping_method: ShippingMethod12;
    shipping_method_id?: ShippingMethodId10;
    total?: Total40;
    subtotal?: Subtotal40;
    id?: Id242;
    description?: Description87;
    tax_rate_id?: TaxRateId16;
    code?: Code42;
    rate?: Rate20;
    provider_id?: ProviderId44;
    created_at?: CreatedAt164;
    updated_at?: UpdatedAt158;
}

export interface ShippingMethod12 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ShippingMethodId10 {
    type: string;
    title: string;
    description: string;
}

export interface Total40 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal40 {
    type: string;
    title: string;
    description: string;
}

export interface Id242 {
    type: string;
    title: string;
    description: string;
}

export interface Description87 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId16 {
    type: string;
    title: string;
    description: string;
}

export interface Code42 {
    type: string;
    title: string;
    description: string;
}

export interface Rate20 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId44 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt164 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt158 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Adjustments17 {
    type: string;
    description: string;
    items: Items480;
}

export interface Items480 {
    "type"?: string;
    "description"?: string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties"?: Properties533;
    "allOf"?: AllOf31[];
}

export interface Properties533 {
    shipping_method: ShippingMethod13;
    shipping_method_id: ShippingMethodId11;
    id: Id243;
    code: Code43;
    amount: Amount42;
    order_id: OrderId40;
    description: Description88;
    promotion_id: PromotionId15;
    provider_id: ProviderId45;
    created_at: CreatedAt165;
    updated_at: UpdatedAt159;
}

export interface ShippingMethod13 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ShippingMethodId11 {
    type: string;
    title: string;
    description: string;
}

export interface Id243 {
    type: string;
    title: string;
    description: string;
}

export interface Code43 {
    type: string;
    title: string;
    description: string;
}

export interface Amount42 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId40 {
    type: string;
    title: string;
    description: string;
}

export interface Description88 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId15 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId45 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt165 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt159 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AllOf31 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties534;
}

export interface Properties534 {
    shipping_method: ShippingMethod14;
    shipping_method_id?: ShippingMethodId12;
    id?: Id244;
    code?: Code44;
    amount?: Amount43;
    order_id?: OrderId41;
    description?: Description89;
    promotion_id?: PromotionId16;
    provider_id?: ProviderId46;
    created_at?: CreatedAt166;
    updated_at?: UpdatedAt160;
}

export interface ShippingMethod14 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ShippingMethodId12 {
    type: string;
    title: string;
    description: string;
}

export interface Id244 {
    type: string;
    title: string;
    description: string;
}

export interface Code44 {
    type: string;
    title: string;
    description: string;
}

export interface Amount43 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId41 {
    type: string;
    title: string;
    description: string;
}

export interface Description89 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId16 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId46 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt166 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt160 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalTotal25 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal25 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal25 {
    type: string;
    title: string;
    description: string;
}

export interface Total41 {
    type: string;
    title: string;
    description: string;
}

export interface Detail11 {
    "type"?: string;
    "description"?: string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties"?: Properties535;
    "allOf"?: AllOf32[];
}

export interface Properties535 {
    id: Id245;
    shipping_method_id: ShippingMethodId13;
    shipping_method: ShippingMethod15;
    claim_id: ClaimId9;
    exchange_id: ExchangeId9;
    return_id: ReturnId12;
    created_at: CreatedAt167;
    updated_at: UpdatedAt161;
}

export interface Id245 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethodId13 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethod15 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ClaimId9 {
    type: string;
    title: string;
    description: string;
}

export interface ExchangeId9 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId12 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt167 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt161 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AllOf32 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties536;
}

export interface Properties536 {
    id?: Id246;
    shipping_method_id?: ShippingMethodId14;
    shipping_method: ShippingMethod16;
    claim_id?: ClaimId10;
    exchange_id?: ExchangeId10;
    return_id?: ReturnId13;
    created_at?: CreatedAt168;
    updated_at?: UpdatedAt162;
}

export interface Id246 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethodId14 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethod16 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ClaimId10 {
    type: string;
    title: string;
    description: string;
}

export interface ExchangeId10 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId13 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt168 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt162 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Subtotal41 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal25 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal25 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal25 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt169 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt163 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface ShippingMethodId15 {
    type: string;
    title: string;
    description: string;
}

export interface Total42 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal42 {
    type: string;
    title: string;
    description: string;
}

export interface Id247 {
    type: string;
    title: string;
    description: string;
}

export interface Description90 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId17 {
    type: string;
    title: string;
    description: string;
}

export interface Code45 {
    type: string;
    title: string;
    description: string;
}

export interface Rate21 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId47 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt170 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt164 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Adjustments18 {
    type: string;
    description: string;
    items: Items481;
}

export interface Items481 {
    allOf: AllOf33[];
    description: string;
}

export interface AllOf33 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties537;
}

export interface Properties537 {
    shipping_method: ShippingMethod17;
    shipping_method_id?: ShippingMethodId22;
    id?: Id255;
    code?: Code50;
    amount?: Amount47;
    order_id?: OrderId45;
    description?: Description96;
    promotion_id?: PromotionId19;
    provider_id?: ProviderId52;
    created_at?: CreatedAt178;
    updated_at?: UpdatedAt172;
}

export interface ShippingMethod17 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties538;
}

export interface Properties538 {
    id: Id248;
    order_id: OrderId42;
    name: Name45;
    description: Description91;
    amount: Amount44;
    is_tax_inclusive: IsTaxInclusive24;
    shipping_option_id: ShippingOptionId20;
    data: Data25;
    metadata: Metadata172;
    tax_lines: TaxLines19;
    adjustments: Adjustments19;
    original_total: OriginalTotal26;
    original_subtotal: OriginalSubtotal26;
    original_tax_total: OriginalTaxTotal26;
    total: Total45;
    detail: Detail12;
    subtotal: Subtotal45;
    tax_total: TaxTotal26;
    discount_total: DiscountTotal26;
    discount_tax_total: DiscountTaxTotal26;
    created_at: CreatedAt177;
    updated_at: UpdatedAt171;
}

export interface Id248 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId42 {
    type: string;
    title: string;
    description: string;
}

export interface Name45 {
    type: string;
    title: string;
    description: string;
}

export interface Description91 {
    type: string;
    title: string;
    description: string;
}

export interface Amount44 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive24 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId20 {
    type: string;
    title: string;
    description: string;
}

export interface Data25 {
    type: string;
    description: string;
}

export interface Metadata172 {
    type: string;
    description: string;
}

export interface TaxLines19 {
    type: string;
    description: string;
    items: Items482;
}

export interface Items482 {
    "type"?: string;
    "description"?: string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties"?: Properties539;
    "allOf"?: AllOf34[];
}

export interface Properties539 {
    shipping_method: ShippingMethod18;
    shipping_method_id: ShippingMethodId16;
    total: Total43;
    subtotal: Subtotal43;
    id: Id249;
    description: Description92;
    tax_rate_id: TaxRateId18;
    code: Code46;
    rate: Rate22;
    provider_id: ProviderId48;
    created_at: CreatedAt171;
    updated_at: UpdatedAt165;
}

export interface ShippingMethod18 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ShippingMethodId16 {
    type: string;
    title: string;
    description: string;
}

export interface Total43 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal43 {
    type: string;
    title: string;
    description: string;
}

export interface Id249 {
    type: string;
    title: string;
    description: string;
}

export interface Description92 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId18 {
    type: string;
    title: string;
    description: string;
}

export interface Code46 {
    type: string;
    title: string;
    description: string;
}

export interface Rate22 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId48 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt171 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt165 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AllOf34 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties540;
}

export interface Properties540 {
    shipping_method: ShippingMethod19;
    shipping_method_id?: ShippingMethodId17;
    total?: Total44;
    subtotal?: Subtotal44;
    id?: Id250;
    description?: Description93;
    tax_rate_id?: TaxRateId19;
    code?: Code47;
    rate?: Rate23;
    provider_id?: ProviderId49;
    created_at?: CreatedAt172;
    updated_at?: UpdatedAt166;
}

export interface ShippingMethod19 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ShippingMethodId17 {
    type: string;
    title: string;
    description: string;
}

export interface Total44 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal44 {
    type: string;
    title: string;
    description: string;
}

export interface Id250 {
    type: string;
    title: string;
    description: string;
}

export interface Description93 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId19 {
    type: string;
    title: string;
    description: string;
}

export interface Code47 {
    type: string;
    title: string;
    description: string;
}

export interface Rate23 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId49 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt172 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt166 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Adjustments19 {
    type: string;
    description: string;
    items: Items483;
}

export interface Items483 {
    "type"?: string;
    "description"?: string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties"?: Properties541;
    "allOf"?: AllOf35[];
}

export interface Properties541 {
    shipping_method: ShippingMethod20;
    shipping_method_id: ShippingMethodId18;
    id: Id251;
    code: Code48;
    amount: Amount45;
    order_id: OrderId43;
    description: Description94;
    promotion_id: PromotionId17;
    provider_id: ProviderId50;
    created_at: CreatedAt173;
    updated_at: UpdatedAt167;
}

export interface ShippingMethod20 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ShippingMethodId18 {
    type: string;
    title: string;
    description: string;
}

export interface Id251 {
    type: string;
    title: string;
    description: string;
}

export interface Code48 {
    type: string;
    title: string;
    description: string;
}

export interface Amount45 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId43 {
    type: string;
    title: string;
    description: string;
}

export interface Description94 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId17 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId50 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt173 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt167 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AllOf35 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties542;
}

export interface Properties542 {
    shipping_method: ShippingMethod21;
    shipping_method_id?: ShippingMethodId19;
    id?: Id252;
    code?: Code49;
    amount?: Amount46;
    order_id?: OrderId44;
    description?: Description95;
    promotion_id?: PromotionId18;
    provider_id?: ProviderId51;
    created_at?: CreatedAt174;
    updated_at?: UpdatedAt168;
}

export interface ShippingMethod21 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ShippingMethodId19 {
    type: string;
    title: string;
    description: string;
}

export interface Id252 {
    type: string;
    title: string;
    description: string;
}

export interface Code49 {
    type: string;
    title: string;
    description: string;
}

export interface Amount46 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId44 {
    type: string;
    title: string;
    description: string;
}

export interface Description95 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId18 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId51 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt174 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt168 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalTotal26 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal26 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal26 {
    type: string;
    title: string;
    description: string;
}

export interface Total45 {
    type: string;
    title: string;
    description: string;
}

export interface Detail12 {
    "type"?: string;
    "description"?: string;
    "x-schemaName"?: string;
    "required"?: string[];
    "properties"?: Properties543;
    "allOf"?: AllOf36[];
}

export interface Properties543 {
    id: Id253;
    shipping_method_id: ShippingMethodId20;
    shipping_method: ShippingMethod22;
    claim_id: ClaimId11;
    exchange_id: ExchangeId11;
    return_id: ReturnId14;
    created_at: CreatedAt175;
    updated_at: UpdatedAt169;
}

export interface Id253 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethodId20 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethod22 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ClaimId11 {
    type: string;
    title: string;
    description: string;
}

export interface ExchangeId11 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId14 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt175 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt169 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface AllOf36 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties544;
}

export interface Properties544 {
    id?: Id254;
    shipping_method_id?: ShippingMethodId21;
    shipping_method: ShippingMethod23;
    claim_id?: ClaimId12;
    exchange_id?: ExchangeId12;
    return_id?: ReturnId15;
    created_at?: CreatedAt176;
    updated_at?: UpdatedAt170;
}

export interface Id254 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethodId21 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethod23 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ClaimId12 {
    type: string;
    title: string;
    description: string;
}

export interface ExchangeId12 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId15 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt176 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt170 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Subtotal45 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal26 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal26 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal26 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt177 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt171 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface ShippingMethodId22 {
    type: string;
    title: string;
    description: string;
}

export interface Id255 {
    type: string;
    title: string;
    description: string;
}

export interface Code50 {
    type: string;
    title: string;
    description: string;
}

export interface Amount47 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId45 {
    type: string;
    title: string;
    description: string;
}

export interface Description96 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId19 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId52 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt178 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt172 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface OriginalTotal27 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal27 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal27 {
    type: string;
    title: string;
    description: string;
}

export interface Total46 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal46 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal27 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal27 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal27 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt179 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt173 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Detail13 {
    allOf: AllOf37[];
    description: string;
}

export interface AllOf37 {
    $ref?: string;
    type?: string;
    description?: string;
    required?: string[];
    properties?: Properties545;
}

export interface Properties545 {
    shipping_method: ShippingMethod24;
}

export interface ShippingMethod24 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties546;
}

export interface Properties546 {
    tax_lines: TaxLines20;
    adjustments: Adjustments20;
    detail: Detail14;
    id: Id259;
    order_id: OrderId47;
    name: Name46;
    description: Description99;
    amount: Amount49;
    is_tax_inclusive: IsTaxInclusive25;
    shipping_option_id: ShippingOptionId21;
    data: Data26;
    metadata: Metadata173;
    original_total: OriginalTotal28;
    original_subtotal: OriginalSubtotal28;
    original_tax_total: OriginalTaxTotal28;
    total: Total48;
    subtotal: Subtotal48;
    tax_total: TaxTotal28;
    discount_total: DiscountTotal28;
    discount_tax_total: DiscountTaxTotal28;
    created_at: CreatedAt183;
    updated_at: UpdatedAt177;
}

export interface TaxLines20 {
    type: string;
    description: string;
    items: Items484;
}

export interface Items484 {
    allOf: AllOf38[];
}

export interface AllOf38 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties547;
}

export interface Properties547 {
    shipping_method: ShippingMethod25;
    shipping_method_id?: ShippingMethodId23;
    total?: Total47;
    subtotal?: Subtotal47;
    id?: Id256;
    description?: Description97;
    tax_rate_id?: TaxRateId20;
    code?: Code51;
    rate?: Rate24;
    provider_id?: ProviderId53;
    created_at?: CreatedAt180;
    updated_at?: UpdatedAt174;
}

export interface ShippingMethod25 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ShippingMethodId23 {
    type: string;
    title: string;
    description: string;
}

export interface Total47 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal47 {
    type: string;
    title: string;
    description: string;
}

export interface Id256 {
    type: string;
    title: string;
    description: string;
}

export interface Description97 {
    type: string;
    title: string;
    description: string;
}

export interface TaxRateId20 {
    type: string;
    title: string;
    description: string;
}

export interface Code51 {
    type: string;
    title: string;
    description: string;
}

export interface Rate24 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId53 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt180 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt174 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Adjustments20 {
    type: string;
    description: string;
    items: Items485;
}

export interface Items485 {
    allOf: AllOf39[];
}

export interface AllOf39 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties548;
}

export interface Properties548 {
    shipping_method: ShippingMethod26;
    shipping_method_id?: ShippingMethodId24;
    id?: Id257;
    code?: Code52;
    amount?: Amount48;
    order_id?: OrderId46;
    description?: Description98;
    promotion_id?: PromotionId20;
    provider_id?: ProviderId54;
    created_at?: CreatedAt181;
    updated_at?: UpdatedAt175;
}

export interface ShippingMethod26 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ShippingMethodId24 {
    type: string;
    title: string;
    description: string;
}

export interface Id257 {
    type: string;
    title: string;
    description: string;
}

export interface Code52 {
    type: string;
    title: string;
    description: string;
}

export interface Amount48 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId46 {
    type: string;
    title: string;
    description: string;
}

export interface Description98 {
    type: string;
    title: string;
    description: string;
}

export interface PromotionId20 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId54 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt181 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt175 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Detail14 {
    allOf: AllOf40[];
}

export interface AllOf40 {
    "type": string;
    "description": string;
    "x-schemaName"?: string;
    "required": string[];
    "properties": Properties549;
}

export interface Properties549 {
    id?: Id258;
    shipping_method_id?: ShippingMethodId25;
    shipping_method: ShippingMethod27;
    claim_id?: ClaimId13;
    exchange_id?: ExchangeId13;
    return_id?: ReturnId16;
    created_at?: CreatedAt182;
    updated_at?: UpdatedAt176;
}

export interface Id258 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethodId25 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingMethod27 {
    "type": string;
    "description": string;
    "x-schemaName": string;
}

export interface ClaimId13 {
    type: string;
    title: string;
    description: string;
}

export interface ExchangeId13 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId16 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt182 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt176 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Id259 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId47 {
    type: string;
    title: string;
    description: string;
}

export interface Name46 {
    type: string;
    title: string;
    description: string;
}

export interface Description99 {
    type: string;
    title: string;
    description: string;
}

export interface Amount49 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive25 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId21 {
    type: string;
    title: string;
    description: string;
}

export interface Data26 {
    type: string;
    description: string;
}

export interface Metadata173 {
    type: string;
    description: string;
}

export interface OriginalTotal28 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalSubtotal28 {
    type: string;
    title: string;
    description: string;
}

export interface OriginalTaxTotal28 {
    type: string;
    title: string;
    description: string;
}

export interface Total48 {
    type: string;
    title: string;
    description: string;
}

export interface Subtotal48 {
    type: string;
    title: string;
    description: string;
}

export interface TaxTotal28 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTotal28 {
    type: string;
    title: string;
    description: string;
}

export interface DiscountTaxTotal28 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt183 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt177 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface StorePaymentCollection {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties550;
}

export interface Properties550 {
    id: Id260;
    currency_code: CurrencyCode35;
    amount: Amount50;
    authorized_amount: AuthorizedAmount5;
    captured_amount: CapturedAmount5;
    refunded_amount: RefundedAmount5;
    completed_at: CompletedAt3;
    created_at: CreatedAt184;
    updated_at: UpdatedAt178;
    metadata: Metadata174;
    status: Status29;
    payment_providers: PaymentProviders7;
    payment_sessions: PaymentSessions3;
    payments: Payments3;
}

export interface Id260 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode35 {
    type: string;
    title: string;
    description: string;
}

export interface Amount50 {
    type: string;
    title: string;
    description: string;
}

export interface AuthorizedAmount5 {
    type: string;
    title: string;
    description: string;
}

export interface CapturedAmount5 {
    type: string;
    title: string;
    description: string;
}

export interface RefundedAmount5 {
    type: string;
    title: string;
    description: string;
}

export interface CompletedAt3 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CreatedAt184 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt178 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata174 {
    type: string;
    description: string;
}

export interface Status29 {
    type: string;
    description: string;
    enum: string[];
}

export interface PaymentProviders7 {
    type: string;
    description: string;
    items: Items486;
}

export interface Items486 {
    $ref: string;
}

export interface PaymentSessions3 {
    type: string;
    description: string;
    items: Items487;
}

export interface Items487 {
    $ref: string;
}

export interface Payments3 {
    type: string;
    description: string;
    items: Items488;
}

export interface Items488 {
    $ref: string;
}

export interface StorePaymentCollectionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties551;
}

export interface Properties551 {
    payment_collection: PaymentCollection8;
}

export interface PaymentCollection8 {
    $ref: string;
}

export interface StorePaymentProvider {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties552;
}

export interface Properties552 {
    id: Id261;
}

export interface Id261 {
    type: string;
    title: string;
    description: string;
}

export interface StorePaymentSession {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties553;
    "required": string[];
}

export interface Properties553 {
    id: Id262;
    amount: Amount51;
    currency_code: CurrencyCode36;
    provider_id: ProviderId55;
    data: Data27;
    context: Context4;
    status: Status30;
    authorized_at: AuthorizedAt3;
    payment_collection: PaymentCollection9;
    payment: Payment7;
}

export interface Id262 {
    type: string;
    title: string;
    description: string;
}

export interface Amount51 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode36 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ProviderId55 {
    type: string;
    title: string;
    description: string;
}

export interface Data27 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs114 {
    url: string;
}

export interface Context4 {
    type: string;
    description: string;
    example: Example17;
}

export interface Example17 {
    customer: Customer9;
}

export interface Customer9 {
    id: string;
}

export interface Status30 {
    type: string;
    description: string;
    enum: string[];
}

export interface AuthorizedAt3 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface PaymentCollection9 {
    type: string;
}

export interface Payment7 {
    $ref: string;
}

export interface StorePrice {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties554;
}

export interface Properties554 {
    id: Id263;
    currency_code: CurrencyCode37;
    amount: Amount52;
    min_quantity: MinQuantity8;
    max_quantity: MaxQuantity9;
    price_rules: PriceRules2;
}

export interface Id263 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode37 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Amount52 {
    type: string;
    title: string;
    description: string;
}

export interface MinQuantity8 {
    type: string;
    title: string;
    description: string;
}

export interface MaxQuantity9 {
    type: string;
    title: string;
    description: string;
}

export interface PriceRules2 {
    type: string;
    description: string;
    items: Items489;
}

export interface Items489 {
    $ref: string;
}

export interface StorePriceRule {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties555;
}

export interface Properties555 {
    id: Id264;
    attribute: Attribute11;
    operator: Operator8;
    value: Value27;
}

export interface Id264 {
    type: string;
    title: string;
    description: string;
}

export interface Attribute11 {
    type: string;
    title: string;
    description: string;
}

export interface Operator8 {
    type: string;
    description: string;
    enum: string[];
}

export interface Value27 {
    type: string;
    title: string;
    description: string;
}

export interface StoreProduct {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties556;
}

export interface Properties556 {
    categories: Categories9;
    type: Type30;
    length: Length19;
    title: Title50;
    status: Status31;
    options: Options18;
    description: Description100;
    id: Id265;
    metadata: Metadata175;
    created_at: CreatedAt185;
    updated_at: UpdatedAt179;
    variants: Variants9;
    handle: Handle17;
    subtitle: Subtitle19;
    is_giftcard: IsGiftcard9;
    thumbnail: Thumbnail21;
    width: Width19;
    weight: Weight19;
    height: Height19;
    origin_country: OriginCountry19;
    hs_code: HsCode19;
    mid_code: MidCode19;
    material: Material19;
    collection: Collection8;
    collection_id: CollectionId9;
    type_id: TypeId9;
    tags: Tags9;
    images: Images9;
    discountable: Discountable9;
    external_id: ExternalId11;
    deleted_at: DeletedAt67;
}

export interface Categories9 {
    type: string;
    description: string;
    items: Items490;
}

export interface Items490 {
    type: string;
}

export interface Type30 {
    $ref: string;
}

export interface Length19 {
    type: string;
    title: string;
    description: string;
}

export interface Title50 {
    type: string;
    title: string;
    description: string;
}

export interface Status31 {
    type: string;
    description: string;
    enum: string[];
}

export interface Options18 {
    type: string;
    description: string;
    items: Items491;
}

export interface Items491 {
    $ref: string;
}

export interface Description100 {
    type: string;
    title: string;
    description: string;
}

export interface Id265 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata175 {
    type: string;
    description: string;
}

export interface CreatedAt185 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt179 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Variants9 {
    type: string;
    description: string;
    items: Items492;
}

export interface Items492 {
    $ref: string;
}

export interface Handle17 {
    type: string;
    title: string;
    description: string;
}

export interface Subtitle19 {
    type: string;
    title: string;
    description: string;
}

export interface IsGiftcard9 {
    type: string;
    title: string;
    description: string;
}

export interface Thumbnail21 {
    type: string;
    title: string;
    description: string;
}

export interface Width19 {
    type: string;
    title: string;
    description: string;
}

export interface Weight19 {
    type: string;
    title: string;
    description: string;
}

export interface Height19 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry19 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode19 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode19 {
    type: string;
    title: string;
    description: string;
}

export interface Material19 {
    type: string;
    title: string;
    description: string;
}

export interface Collection8 {
    $ref: string;
}

export interface CollectionId9 {
    type: string;
    title: string;
    description: string;
}

export interface TypeId9 {
    type: string;
    title: string;
    description: string;
}

export interface Tags9 {
    type: string;
    description: string;
    items: Items493;
}

export interface Items493 {
    $ref: string;
}

export interface Images9 {
    type: string;
    description: string;
    items: Items494;
}

export interface Items494 {
    $ref: string;
}

export interface Discountable9 {
    type: string;
    title: string;
    description: string;
}

export interface ExternalId11 {
    type: string;
    title: string;
    description: string;
}

export interface DeletedAt67 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface StoreProductCategory {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties557;
}

export interface Properties557 {
    products: Products7;
    id: Id266;
    name: Name47;
    description: Description101;
    handle: Handle18;
    rank: Rank6;
    parent_category_id: ParentCategoryId4;
    parent_category: ParentCategory3;
    category_children: CategoryChildren3;
    metadata: Metadata176;
    created_at: CreatedAt186;
    updated_at: UpdatedAt180;
    deleted_at: DeletedAt68;
}

export interface Products7 {
    type: string;
    description: string;
    items: Items495;
}

export interface Items495 {
    $ref: string;
}

export interface Id266 {
    type: string;
    title: string;
    description: string;
}

export interface Name47 {
    type: string;
    title: string;
    description: string;
}

export interface Description101 {
    type: string;
    title: string;
    description: string;
}

export interface Handle18 {
    type: string;
    title: string;
    description: string;
}

export interface Rank6 {
    type: string;
    title: string;
    description: string;
}

export interface ParentCategoryId4 {
    type: string;
    title: string;
    description: string;
}

export interface ParentCategory3 {
    type: string;
}

export interface CategoryChildren3 {
    type: string;
    description: string;
    items: Items496;
}

export interface Items496 {
    type: string;
}

export interface Metadata176 {
    type: string;
    description: string;
}

export interface CreatedAt186 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt180 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt68 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface StoreProductCategoryListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties558;
}

export interface Properties558 {
    limit: Limit27;
    offset: Offset25;
    count: Count25;
    product_categories: ProductCategories2;
}

export interface Limit27 {
    type: string;
    title: string;
    description: string;
}

export interface Offset25 {
    type: string;
    title: string;
    description: string;
}

export interface Count25 {
    type: string;
    title: string;
    description: string;
}

export interface ProductCategories2 {
    type: string;
    description: string;
    items: Items497;
}

export interface Items497 {
    $ref: string;
}

export interface StoreProductCategoryResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties559;
}

export interface Properties559 {
    product_category: ProductCategory2;
}

export interface ProductCategory2 {
    $ref: string;
}

export interface StoreProductImage {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties560;
}

export interface Properties560 {
    id: Id267;
    url: Url7;
    created_at: CreatedAt187;
    updated_at: UpdatedAt181;
    deleted_at: DeletedAt69;
    metadata: Metadata177;
    rank: Rank7;
}

export interface Id267 {
    type: string;
    title: string;
    description: string;
}

export interface Url7 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt187 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt181 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt69 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata177 {
    type: string;
    description: string;
}

export interface Rank7 {
    type: string;
    title: string;
    description: string;
}

export interface StoreProductOption {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties561;
    "required": string[];
}

export interface Properties561 {
    id: Id268;
    title: Title51;
    product: Product19;
    product_id: ProductId18;
    values: Values8;
    metadata: Metadata178;
    created_at: CreatedAt188;
    updated_at: UpdatedAt182;
    deleted_at: DeletedAt70;
}

export interface Id268 {
    type: string;
    title: string;
    description: string;
}

export interface Title51 {
    type: string;
    title: string;
    description: string;
}

export interface Product19 {
    type: string;
}

export interface ProductId18 {
    type: string;
    title: string;
    description: string;
}

export interface Values8 {
    type: string;
    description: string;
    items: Items498;
}

export interface Items498 {
    $ref: string;
}

export interface Metadata178 {
    type: string;
    description: string;
}

export interface CreatedAt188 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt182 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt70 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface StoreProductOptionValue {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties562;
}

export interface Properties562 {
    id: Id269;
    value: Value28;
    option: Option3;
    option_id: OptionId6;
    metadata: Metadata179;
    created_at: CreatedAt189;
    updated_at: UpdatedAt183;
    deleted_at: DeletedAt71;
}

export interface Id269 {
    type: string;
    title: string;
    description: string;
}

export interface Value28 {
    type: string;
    title: string;
    description: string;
}

export interface Option3 {
    type: string;
}

export interface OptionId6 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata179 {
    type: string;
    description: string;
}

export interface CreatedAt189 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt183 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt71 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface StoreProductResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties563;
}

export interface Properties563 {
    product: Product20;
}

export interface Product20 {
    $ref: string;
}

export interface StoreProductTag {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties564;
    "required": string[];
}

export interface Properties564 {
    id: Id270;
    value: Value29;
    created_at: CreatedAt190;
    updated_at: UpdatedAt184;
    deleted_at: DeletedAt72;
    metadata: Metadata180;
}

export interface Id270 {
    type: string;
    title: string;
    description: string;
}

export interface Value29 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt190 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt184 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt72 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Metadata180 {
    type: string;
    description: string;
}

export interface StoreProductTagListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties565;
}

export interface Properties565 {
    limit: Limit28;
    offset: Offset26;
    count: Count26;
    product_tags: ProductTags2;
}

export interface Limit28 {
    type: string;
    title: string;
    description: string;
}

export interface Offset26 {
    type: string;
    title: string;
    description: string;
}

export interface Count26 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTags2 {
    type: string;
    description: string;
    items: Items499;
}

export interface Items499 {
    $ref: string;
}

export interface StoreProductTagResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties566;
}

export interface Properties566 {
    product_tag: ProductTag2;
}

export interface ProductTag2 {
    $ref: string;
}

export interface StoreProductType {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties567;
}

export interface Properties567 {
    id: Id271;
    metadata: Metadata181;
    created_at: CreatedAt191;
    updated_at: UpdatedAt185;
    deleted_at: DeletedAt73;
    value: Value30;
}

export interface Id271 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata181 {
    type: string;
    description: string;
}

export interface CreatedAt191 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt185 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt73 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface Value30 {
    type: string;
    title: string;
    description: string;
}

export interface StoreProductTypeListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties568;
}

export interface Properties568 {
    limit: Limit29;
    offset: Offset27;
    count: Count27;
    product_types: ProductTypes2;
}

export interface Limit29 {
    type: string;
    title: string;
    description: string;
}

export interface Offset27 {
    type: string;
    title: string;
    description: string;
}

export interface Count27 {
    type: string;
    title: string;
    description: string;
}

export interface ProductTypes2 {
    type: string;
    description: string;
    items: Items500;
}

export interface Items500 {
    $ref: string;
}

export interface StoreProductTypeResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties569;
}

export interface Properties569 {
    product_type: ProductType12;
}

export interface ProductType12 {
    $ref: string;
}

export interface StoreProductVariant {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties570;
    "required": string[];
}

export interface Properties570 {
    options: Options19;
    product: Product21;
    length: Length20;
    title: Title52;
    metadata: Metadata182;
    id: Id272;
    width: Width20;
    weight: Weight20;
    height: Height20;
    origin_country: OriginCountry20;
    hs_code: HsCode20;
    mid_code: MidCode20;
    material: Material20;
    created_at: CreatedAt192;
    updated_at: UpdatedAt186;
    deleted_at: DeletedAt74;
    product_id: ProductId19;
    sku: Sku13;
    barcode: Barcode11;
    ean: Ean9;
    upc: Upc9;
    allow_backorder: AllowBackorder13;
    manage_inventory: ManageInventory9;
    inventory_quantity: InventoryQuantity6;
    variant_rank: VariantRank9;
    calculated_price: CalculatedPrice9;
}

export interface Options19 {
    type: string;
    description: string;
    items: Items501;
}

export interface Items501 {
    $ref: string;
}

export interface Product21 {
    type: string;
}

export interface Length20 {
    type: string;
    title: string;
    description: string;
}

export interface Title52 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata182 {
    type: string;
    description: string;
}

export interface Id272 {
    type: string;
    title: string;
    description: string;
}

export interface Width20 {
    type: string;
    title: string;
    description: string;
}

export interface Weight20 {
    type: string;
    title: string;
    description: string;
}

export interface Height20 {
    type: string;
    title: string;
    description: string;
}

export interface OriginCountry20 {
    type: string;
    title: string;
    description: string;
}

export interface HsCode20 {
    type: string;
    title: string;
    description: string;
}

export interface MidCode20 {
    type: string;
    title: string;
    description: string;
}

export interface Material20 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt192 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt186 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt74 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface ProductId19 {
    type: string;
    title: string;
    description: string;
}

export interface Sku13 {
    type: string;
    title: string;
    description: string;
}

export interface Barcode11 {
    type: string;
    title: string;
    description: string;
}

export interface Ean9 {
    type: string;
    title: string;
    description: string;
}

export interface Upc9 {
    type: string;
    title: string;
    description: string;
}

export interface AllowBackorder13 {
    type: string;
    title: string;
    description: string;
}

export interface ManageInventory9 {
    type: string;
    title: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs115 {
    url: string;
    description: string;
}

export interface InventoryQuantity6 {
    type: string;
    title: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs116 {
    url: string;
    description: string;
}

export interface VariantRank9 {
    type: string;
    title: string;
    description: string;
}

export interface CalculatedPrice9 {
    $ref: string;
}

export interface StoreRegion {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties571;
}

export interface Properties571 {
    id: Id273;
    name: Name48;
    currency_code: CurrencyCode38;
    automatic_taxes: AutomaticTaxes4;
    countries: Countries4;
    payment_providers: PaymentProviders8;
    metadata: Metadata183;
    created_at: CreatedAt193;
    updated_at: UpdatedAt187;
}

export interface Id273 {
    type: string;
    title: string;
    description: string;
}

export interface Name48 {
    type: string;
    title: string;
    description: string;
}

export interface CurrencyCode38 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface AutomaticTaxes4 {
    type: string;
    title: string;
    description: string;
}

export interface Countries4 {
    type: string;
    description: string;
    items: Items502;
}

export interface Items502 {
    $ref: string;
}

export interface PaymentProviders8 {
    type: string;
    description: string;
    items: Items503;
}

export interface Items503 {
    $ref: string;
}

export interface Metadata183 {
    type: string;
    description: string;
}

export interface CreatedAt193 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt187 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface StoreRegionCountry {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties572;
}

export interface Properties572 {
    id: Id274;
    iso_2: Iso23;
    iso_3: Iso33;
    num_code: NumCode3;
    name: Name49;
    display_name: DisplayName3;
}

export interface Id274 {
    type: string;
    title: string;
    description: string;
}

export interface Iso23 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Iso33 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface NumCode3 {
    type: string;
    title: string;
    description: string;
    example: number;
}

export interface Name49 {
    type: string;
    title: string;
    description: string;
}

export interface DisplayName3 {
    type: string;
    title: string;
    description: string;
}

export interface StoreRequestOrderTransfer {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties573;
}

export interface Properties573 {
    description: Description102;
}

export interface Description102 {
    type: string;
    title: string;
    description: string;
}

export interface StoreReturn2 {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties574;
}

export interface Properties574 {
    id: Id275;
    order_id: OrderId48;
    status: Status32;
    exchange_id: ExchangeId14;
    location_id: LocationId19;
    claim_id: ClaimId14;
    display_id: DisplayId13;
    refund_amount: RefundAmount5;
    items: Items504;
    received_at: ReceivedAt3;
    created_at: CreatedAt194;
    canceled_at: CanceledAt17;
}

export interface Id275 {
    type: string;
    title: string;
    description: string;
}

export interface OrderId48 {
    type: string;
    title: string;
    description: string;
}

export interface Status32 {
    type: string;
    title: string;
    description: string;
}

export interface ExchangeId14 {
    type: string;
    title: string;
    description: string;
}

export interface LocationId19 {
    type: string;
    title: string;
    description: string;
}

export interface ClaimId14 {
    type: string;
    title: string;
    description: string;
}

export interface DisplayId13 {
    type: string;
    title: string;
    description: string;
}

export interface RefundAmount5 {
    type: string;
    title: string;
    description: string;
}

export interface Items504 {
    type: string;
    description: string;
    items: Items505;
}

export interface Items505 {
    $ref: string;
}

export interface ReceivedAt3 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt194 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface CanceledAt17 {
    type: string;
    title: string;
    description: string;
}

export interface StoreReturnItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties575;
    "required": string[];
}

export interface Properties575 {
    id: Id276;
    quantity: Quantity43;
    received_quantity: ReceivedQuantity3;
    damaged_quantity: DamagedQuantity3;
    reason_id: ReasonId10;
    note: Note6;
    item_id: ItemId33;
    return_id: ReturnId17;
    metadata: Metadata184;
}

export interface Id276 {
    type: string;
    title: string;
    description: string;
}

export interface Quantity43 {
    type: string;
    title: string;
    description: string;
}

export interface ReceivedQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface DamagedQuantity3 {
    type: string;
    title: string;
    description: string;
}

export interface ReasonId10 {
    type: string;
    title: string;
    description: string;
}

export interface Note6 {
    type: string;
    title: string;
    description: string;
}

export interface ItemId33 {
    type: string;
    title: string;
    description: string;
}

export interface ReturnId17 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata184 {
    type: string;
    description: string;
}

export interface StoreReturnReason {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties576;
}

export interface Properties576 {
    id: Id277;
    value: Value31;
    label: Label13;
    description: Description103;
    metadata: Metadata185;
    created_at: CreatedAt195;
    updated_at: UpdatedAt188;
}

export interface Id277 {
    type: string;
    title: string;
    description: string;
}

export interface Value31 {
    type: string;
    title: string;
    description: string;
}

export interface Label13 {
    type: string;
    title: string;
    description: string;
}

export interface Description103 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata185 {
    type: string;
    description: string;
}

export interface CreatedAt195 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt188 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface StoreReturnReasonResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties577;
}

export interface Properties577 {
    return_reason: ReturnReason2;
}

export interface ReturnReason2 {
    $ref: string;
}

export interface StoreReturnResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties578;
}

export interface Properties578 {
    return: Return13;
}

export interface Return13 {
    $ref: string;
}

export interface StoreShippingOption {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties579;
}

export interface Properties579 {
    id: Id278;
    name: Name50;
    price_type: PriceType4;
    service_zone_id: ServiceZoneId4;
    provider_id: ProviderId56;
    provider: Provider4;
    shipping_option_type_id: ShippingOptionTypeId2;
    type: Type31;
    shipping_profile_id: ShippingProfileId6;
    amount: Amount53;
    is_tax_inclusive: IsTaxInclusive26;
    data: Data28;
    metadata: Metadata186;
}

export interface Id278 {
    type: string;
    title: string;
    description: string;
}

export interface Name50 {
    type: string;
    title: string;
    description: string;
}

export interface PriceType4 {
    type: string;
    description: string;
    enum: string[];
}

export interface ServiceZoneId4 {
    type: string;
    title: string;
    description: string;
}

export interface ProviderId56 {
    type: string;
    title: string;
    description: string;
}

export interface Provider4 {
    $ref: string;
}

export interface ShippingOptionTypeId2 {
    type: string;
    title: string;
    description: string;
}

export interface Type31 {
    $ref: string;
}

export interface ShippingProfileId6 {
    type: string;
    title: string;
    description: string;
}

export interface Amount53 {
    type: string;
    title: string;
    description: string;
}

export interface IsTaxInclusive26 {
    type: string;
    title: string;
    description: string;
}

export interface Data28 {
    type: string;
    description: string;
    externalDocs: ExternalDocs;
}

export interface ExternalDocs117 {
    url: string;
}

export interface Metadata186 {
    type: string;
    description: string;
}

export interface StoreShippingOptionListResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties580;
}

export interface Properties580 {
    shipping_options: ShippingOptions2;
}

export interface ShippingOptions2 {
    type: string;
    description: string;
    items: Items506;
}

export interface Items506 {
    $ref: string;
}

export interface StoreShippingOptionResponse {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties581;
}

export interface Properties581 {
    shipping_option: ShippingOption2;
}

export interface ShippingOption2 {
    $ref: string;
}

export interface StoreShippingOptionType {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties582;
}

export interface Properties582 {
    id: Id279;
    label: Label14;
    description: Description104;
    code: Code53;
    shipping_option_id: ShippingOptionId22;
    created_at: CreatedAt196;
    updated_at: UpdatedAt189;
    deleted_at: DeletedAt75;
}

export interface Id279 {
    type: string;
    title: string;
    description: string;
}

export interface Label14 {
    type: string;
    title: string;
    description: string;
}

export interface Description104 {
    type: string;
    title: string;
    description: string;
}

export interface Code53 {
    type: string;
    title: string;
    description: string;
}

export interface ShippingOptionId22 {
    type: string;
    title: string;
    description: string;
}

export interface CreatedAt196 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface UpdatedAt189 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface DeletedAt75 {
    type: string;
    format: string;
    title: string;
    description: string;
}

export interface StoreUpdateCartLineItem {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties583;
}

export interface Properties583 {
    quantity: Quantity44;
    metadata: Metadata187;
}

export interface Quantity44 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata187 {
    type: string;
    description: string;
}

export interface StoreUpdateCustomer {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties584;
}

export interface Properties584 {
    company_name: CompanyName5;
    first_name: FirstName23;
    last_name: LastName23;
    phone: Phone23;
    metadata: Metadata188;
}

export interface CompanyName5 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName23 {
    type: string;
    title: string;
    description: string;
}

export interface LastName23 {
    type: string;
    title: string;
    description: string;
}

export interface Phone23 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata188 {
    type: string;
    description: string;
}

export interface UpdateAddress {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties585;
}

export interface Properties585 {
    id: Id280;
    customer_id: CustomerId18;
    company: Company20;
    first_name: FirstName24;
    last_name: LastName24;
    address_1: Address120;
    address_2: Address220;
    city: City21;
    country_code: CountryCode23;
    province: Province20;
    postal_code: PostalCode20;
    phone: Phone24;
    metadata: Metadata189;
}

export interface Id280 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId18 {
    type: string;
    title: string;
    description: string;
}

export interface Company20 {
    type: string;
    title: string;
    description: string;
}

export interface FirstName24 {
    type: string;
    title: string;
    description: string;
}

export interface LastName24 {
    type: string;
    title: string;
    description: string;
}

export interface Address120 {
    type: string;
    title: string;
    description: string;
}

export interface Address220 {
    type: string;
    title: string;
    description: string;
}

export interface City21 {
    type: string;
    title: string;
    description: string;
}

export interface CountryCode23 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface Province20 {
    type: string;
    title: string;
    description: string;
}

export interface PostalCode20 {
    type: string;
    title: string;
    description: string;
}

export interface Phone24 {
    type: string;
    title: string;
    description: string;
}

export interface Metadata189 {
    type: string;
    description: string;
}

export interface UpdateCartData {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "properties": Properties586;
}

export interface Properties586 {
    region_id: RegionId12;
    customer_id: CustomerId19;
    sales_channel_id: SalesChannelId10;
    email: Email18;
    currency_code: CurrencyCode39;
    shipping_address_id: ShippingAddressId;
    billing_address_id: BillingAddressId;
    billing_address: BillingAddress12;
    shipping_address: ShippingAddress12;
    metadata: Metadata190;
}

export interface RegionId12 {
    type: string;
    title: string;
    description: string;
}

export interface CustomerId19 {
    type: string;
    title: string;
    description: string;
}

export interface SalesChannelId10 {
    type: string;
    title: string;
    description: string;
}

export interface Email18 {
    type: string;
    title: string;
    description: string;
    format: string;
}

export interface CurrencyCode39 {
    type: string;
    title: string;
    description: string;
    example: string;
}

export interface ShippingAddressId {
    type: string;
    title: string;
    description: string;
}

export interface BillingAddressId {
    type: string;
    title: string;
    description: string;
}

export interface BillingAddress12 {
    oneOf: OneOf79[];
}

export interface OneOf79 {
    $ref: string;
}

export interface ShippingAddress12 {
    oneOf: OneOf80[];
}

export interface OneOf80 {
    $ref: string;
}

export interface Metadata190 {
    type: string;
    description: string;
}

export interface WorkflowExecutionContext {
    "type": string;
    "description": string;
    "x-schemaName": string;
    "required": string[];
    "properties": Properties587;
}

export interface Properties587 {
    data: Data29;
    compensate: Compensate2;
    errors: Errors;
}

export interface Data29 {
    type: string;
    description: string;
    properties: Properties588;
    required: string[];
}

export interface Properties588 {
    invoke: Invoke2;
    payload: Payload;
}

export interface Invoke2 {
    type: string;
    description: string;
    required: string[];
    additionalProperties: AdditionalProperties2;
}

export interface AdditionalProperties2 {
    type: string;
    properties: Properties589;
}

export interface Properties589 {
    output: Output;
}

export interface Output {
    type: string;
    description: string;
    required: string[];
    properties: Properties590;
}

export interface Properties590 {
    output: Output2;
    compensateInput: CompensateInput2;
}

export interface Output2 {
    description: string;
}

export interface CompensateInput2 {
    description: string;
}

export interface Payload {
    description: string;
}

export interface Compensate2 {
    type: string;
    description: string;
}

export interface Errors {
    type: string;
    description: string;
    items: Items507;
}

export interface Items507 {
    type: string;
    description: string;
    properties: Properties591;
    required: string[];
}

export interface Properties591 {
    error: Error3;
    action: Action4;
    handlerType: HandlerType;
}

export interface Error3 {
    type: string;
    description: string;
}

export interface Action4 {
    type: string;
    title: string;
    description: string;
}

export interface HandlerType {
    type: string;
    title: string;
    description: string;
}

export interface Responses57 {
    "default_error": DefaultError;
    "invalid_state_error": InvalidStateError;
    "invalid_request_error": InvalidRequestError;
    "not_found_error": NotFoundError;
    "400_error": N400Error;
    "500_error": N500Error;
    "unauthorized": Unauthorized;
    "incorrect_credentials": IncorrectCredentials;
}

export interface DefaultError {
    description: string;
    content: Content77;
}

export interface Content77 {
    "application/json": ApplicationJson77;
}

export interface ApplicationJson77 {
    schema: Schema130;
    example: Example18;
}

export interface Schema130 {
    $ref: string;
}

export interface Example18 {
    code: string;
    message: string;
    type: string;
}

export interface InvalidStateError {
    description: string;
    content: Content78;
}

export interface Content78 {
    "application/json": ApplicationJson78;
}

export interface ApplicationJson78 {
    schema: Schema131;
    example: Example19;
}

export interface Schema131 {
    $ref: string;
}

export interface Example19 {
    code: string;
    message: string;
    type: string;
}

export interface InvalidRequestError {
    description: string;
    content: Content79;
}

export interface Content79 {
    "application/json": ApplicationJson79;
}

export interface ApplicationJson79 {
    schema: Schema132;
    example: Example20;
}

export interface Schema132 {
    $ref: string;
}

export interface Example20 {
    code: string;
    message: string;
    type: string;
}

export interface NotFoundError {
    description: string;
    content: Content80;
}

export interface Content80 {
    "application/json": ApplicationJson80;
}

export interface ApplicationJson80 {
    schema: Schema133;
    example: Example21;
}

export interface Schema133 {
    $ref: string;
}

export interface Example21 {
    message: string;
    type: string;
}

export interface N400Error {
    description: string;
    content: Content81;
}

export interface Content81 {
    "application/json": ApplicationJson81;
}

export interface ApplicationJson81 {
    schema: Schema134;
    examples: Examples;
}

export interface Schema134 {
    $ref: string;
}

export interface Examples {
    not_allowed: NotAllowed;
    invalid_data: InvalidData;
}

export interface NotAllowed {
    $ref: string;
}

export interface InvalidData {
    $ref: string;
}

export interface N500Error {
    description: string;
    content: Content82;
}

export interface Content82 {
    "application/json": ApplicationJson82;
}

export interface ApplicationJson82 {
    schema: Schema135;
    examples: Examples2;
}

export interface Schema135 {
    $ref: string;
}

export interface Examples2 {
    database: Database;
    unexpected_state: UnexpectedState;
    invalid_argument: InvalidArgument;
    default_error: DefaultError2;
}

export interface Database {
    $ref: string;
}

export interface UnexpectedState {
    $ref: string;
}

export interface InvalidArgument {
    $ref: string;
}

export interface DefaultError2 {
    $ref: string;
}

export interface Unauthorized {
    description: string;
    content: Content83;
}

export interface Content83 {
    "text/plain": TextPlain;
}

export interface TextPlain {
    schema: Schema136;
}

export interface Schema136 {
    type: string;
    default: string;
    example: string;
}

export interface IncorrectCredentials {
    description: string;
    content: Content84;
}

export interface Content84 {
    "text/plain": TextPlain2;
}

export interface TextPlain2 {
    schema: Schema137;
}

export interface Schema137 {
    type: string;
    default: string;
    example: string;
}

export interface Examples3 {
    not_allowed_error: NotAllowedError;
    invalid_data_error: InvalidDataError;
    multiple_errors: MultipleErrors;
    database_error: DatabaseError;
    unexpected_state_error: UnexpectedStateError;
    invalid_argument_error: InvalidArgumentError;
    default_error: DefaultError3;
}

export interface NotAllowedError {
    summary: string;
    value: Value32;
}

export interface Value32 {
    message: string;
    type: string;
}

export interface InvalidDataError {
    summary: string;
    value: Value33;
}

export interface Value33 {
    message: string;
    type: string;
}

export interface MultipleErrors {
    summary: string;
    value: Value34;
}

export interface Value34 {
    message: string;
    errors: Error4[];
}

export interface Error4 {
    message: string;
    type: string;
}

export interface DatabaseError {
    summary: string;
    value: Value35;
}

export interface Value35 {
    code: string;
    message: string;
    type: string;
}

export interface UnexpectedStateError {
    summary: string;
    value: Value36;
}

export interface Value36 {
    message: string;
    type: string;
}

export interface InvalidArgumentError {
    summary: string;
    value: Value37;
}

export interface Value37 {
    message: string;
    type: string;
}

export interface DefaultError3 {
    summary: string;
    value: Value38;
}

export interface Value38 {
    code: string;
    message: string;
    type: string;
}

export interface SecuritySchemes {
    jwt_token: JwtToken;
    cookie_auth: CookieAuth;
    reset_password: ResetPassword;
}

export interface JwtToken {
    "type": string;
    "x-displayName": string;
    "scheme": string;
}

export interface CookieAuth {
    "type": string;
    "x-displayName": string;
    "in": string;
    "name": string;
}

export interface ResetPassword {
    "type": string;
    "x-displayName": string;
    "scheme": string;
    "x-is-auth": boolean;
}
