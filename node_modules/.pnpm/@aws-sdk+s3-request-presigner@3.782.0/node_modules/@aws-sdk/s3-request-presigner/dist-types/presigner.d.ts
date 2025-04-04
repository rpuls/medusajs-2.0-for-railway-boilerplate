import { SignatureV4MultiRegionInit } from "@aws-sdk/signature-v4-multi-region";
import { AwsCredentialIdentity, RequestPresigner, RequestPresigningArguments } from "@smithy/types";
import { HttpRequest as IHttpRequest } from "@smithy/types";
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type S3RequestPresignerOptions = PartialBy<SignatureV4MultiRegionInit, "service" | "uriEscapePath"> & {
    signingName?: string;
};
export declare class S3RequestPresigner implements RequestPresigner {
    private readonly signer;
    constructor(options: S3RequestPresignerOptions);
    presign(requestToSign: IHttpRequest, { unsignableHeaders, hoistableHeaders, unhoistableHeaders, ...options }?: RequestPresigningArguments): Promise<IHttpRequest>;
    presignWithCredentials(requestToSign: IHttpRequest, credentials: AwsCredentialIdentity, { unsignableHeaders, hoistableHeaders, unhoistableHeaders, ...options }?: RequestPresigningArguments): Promise<IHttpRequest>;
    private prepareRequest;
}
export {};
