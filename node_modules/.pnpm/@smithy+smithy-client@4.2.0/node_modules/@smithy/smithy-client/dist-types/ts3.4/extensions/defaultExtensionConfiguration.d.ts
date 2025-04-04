import { DefaultExtensionConfiguration } from "@smithy/types";
import { PartialChecksumRuntimeConfigType } from "./checksum";
import { PartialRetryRuntimeConfigType } from "./retry";
/**
 * @internal
 */
export type DefaultExtensionRuntimeConfigType = PartialRetryRuntimeConfigType & PartialChecksumRuntimeConfigType;
/**
 * @internal
 *
 * Helper function to resolve default extension configuration from runtime config
 */
export declare const getDefaultExtensionConfiguration: (runtimeConfig: DefaultExtensionRuntimeConfigType) => {
    addChecksumAlgorithm(algo: import("@smithy/types").ChecksumAlgorithm): void;
    checksumAlgorithms(): import("@smithy/types").ChecksumAlgorithm[];
} & {
    setRetryStrategy(retryStrategy: import("@smithy/types").Provider<import("@smithy/types").RetryStrategy | import("@smithy/types").RetryStrategyV2>): void;
    retryStrategy(): import("@smithy/types").Provider<import("@smithy/types").RetryStrategy | import("@smithy/types").RetryStrategyV2>;
};
/**
 * @deprecated use getDefaultExtensionConfiguration
 * @internal
 *
 * Helper function to resolve default extension configuration from runtime config
 */
export declare const getDefaultClientConfiguration: (runtimeConfig: DefaultExtensionRuntimeConfigType) => {
    addChecksumAlgorithm(algo: import("@smithy/types").ChecksumAlgorithm): void;
    checksumAlgorithms(): import("@smithy/types").ChecksumAlgorithm[];
} & {
    setRetryStrategy(retryStrategy: import("@smithy/types").Provider<import("@smithy/types").RetryStrategy | import("@smithy/types").RetryStrategyV2>): void;
    retryStrategy(): import("@smithy/types").Provider<import("@smithy/types").RetryStrategy | import("@smithy/types").RetryStrategyV2>;
};
/**
 * @internal
 *
 * Helper function to resolve runtime config from default extension configuration
 */
export declare const resolveDefaultRuntimeConfig: (config: DefaultExtensionConfiguration) => DefaultExtensionRuntimeConfigType;
