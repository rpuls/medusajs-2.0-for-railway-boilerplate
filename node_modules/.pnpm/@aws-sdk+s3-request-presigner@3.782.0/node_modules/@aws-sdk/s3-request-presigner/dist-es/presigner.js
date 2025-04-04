import { SignatureV4MultiRegion } from "@aws-sdk/signature-v4-multi-region";
import { SHA256_HEADER, UNSIGNED_PAYLOAD } from "./constants";
export class S3RequestPresigner {
    signer;
    constructor(options) {
        const resolvedOptions = {
            service: options.signingName || options.service || "s3",
            uriEscapePath: options.uriEscapePath || false,
            applyChecksum: options.applyChecksum || false,
            ...options,
        };
        this.signer = new SignatureV4MultiRegion(resolvedOptions);
    }
    presign(requestToSign, { unsignableHeaders = new Set(), hoistableHeaders = new Set(), unhoistableHeaders = new Set(), ...options } = {}) {
        this.prepareRequest(requestToSign, {
            unsignableHeaders,
            unhoistableHeaders,
            hoistableHeaders,
        });
        return this.signer.presign(requestToSign, {
            expiresIn: 900,
            unsignableHeaders,
            unhoistableHeaders,
            ...options,
        });
    }
    presignWithCredentials(requestToSign, credentials, { unsignableHeaders = new Set(), hoistableHeaders = new Set(), unhoistableHeaders = new Set(), ...options } = {}) {
        this.prepareRequest(requestToSign, {
            unsignableHeaders,
            unhoistableHeaders,
            hoistableHeaders,
        });
        return this.signer.presignWithCredentials(requestToSign, credentials, {
            expiresIn: 900,
            unsignableHeaders,
            unhoistableHeaders,
            ...options,
        });
    }
    prepareRequest(requestToSign, { unsignableHeaders = new Set(), unhoistableHeaders = new Set(), hoistableHeaders = new Set(), } = {}) {
        unsignableHeaders.add("content-type");
        Object.keys(requestToSign.headers)
            .map((header) => header.toLowerCase())
            .filter((header) => header.startsWith("x-amz-server-side-encryption"))
            .forEach((header) => {
            if (!hoistableHeaders.has(header)) {
                unhoistableHeaders.add(header);
            }
        });
        requestToSign.headers[SHA256_HEADER] = UNSIGNED_PAYLOAD;
        const currentHostHeader = requestToSign.headers.host;
        const port = requestToSign.port;
        const expectedHostHeader = `${requestToSign.hostname}${requestToSign.port != null ? ":" + port : ""}`;
        if (!currentHostHeader || (currentHostHeader === requestToSign.hostname && requestToSign.port != null)) {
            requestToSign.headers.host = expectedHostHeader;
        }
    }
}
