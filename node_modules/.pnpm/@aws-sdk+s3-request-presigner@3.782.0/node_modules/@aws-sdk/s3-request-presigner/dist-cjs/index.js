"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  S3RequestPresigner: () => S3RequestPresigner,
  getSignedUrl: () => getSignedUrl
});
module.exports = __toCommonJS(index_exports);

// src/getSignedUrl.ts
var import_util_format_url = require("@aws-sdk/util-format-url");
var import_middleware_endpoint = require("@smithy/middleware-endpoint");
var import_protocol_http = require("@smithy/protocol-http");

// src/presigner.ts
var import_signature_v4_multi_region = require("@aws-sdk/signature-v4-multi-region");

// src/constants.ts
var UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
var SHA256_HEADER = "X-Amz-Content-Sha256";

// src/presigner.ts
var S3RequestPresigner = class {
  static {
    __name(this, "S3RequestPresigner");
  }
  signer;
  constructor(options) {
    const resolvedOptions = {
      // Allow `signingName` because we want to support usecase of supply client's resolved config
      // directly. Where service equals signingName.
      service: options.signingName || options.service || "s3",
      uriEscapePath: options.uriEscapePath || false,
      applyChecksum: options.applyChecksum || false,
      ...options
    };
    this.signer = new import_signature_v4_multi_region.SignatureV4MultiRegion(resolvedOptions);
  }
  presign(requestToSign, {
    unsignableHeaders = /* @__PURE__ */ new Set(),
    hoistableHeaders = /* @__PURE__ */ new Set(),
    unhoistableHeaders = /* @__PURE__ */ new Set(),
    ...options
  } = {}) {
    this.prepareRequest(requestToSign, {
      unsignableHeaders,
      unhoistableHeaders,
      hoistableHeaders
    });
    return this.signer.presign(requestToSign, {
      expiresIn: 900,
      unsignableHeaders,
      unhoistableHeaders,
      ...options
    });
  }
  presignWithCredentials(requestToSign, credentials, {
    unsignableHeaders = /* @__PURE__ */ new Set(),
    hoistableHeaders = /* @__PURE__ */ new Set(),
    unhoistableHeaders = /* @__PURE__ */ new Set(),
    ...options
  } = {}) {
    this.prepareRequest(requestToSign, {
      unsignableHeaders,
      unhoistableHeaders,
      hoistableHeaders
    });
    return this.signer.presignWithCredentials(requestToSign, credentials, {
      expiresIn: 900,
      unsignableHeaders,
      unhoistableHeaders,
      ...options
    });
  }
  prepareRequest(requestToSign, {
    unsignableHeaders = /* @__PURE__ */ new Set(),
    unhoistableHeaders = /* @__PURE__ */ new Set(),
    hoistableHeaders = /* @__PURE__ */ new Set()
  } = {}) {
    unsignableHeaders.add("content-type");
    Object.keys(requestToSign.headers).map((header) => header.toLowerCase()).filter((header) => header.startsWith("x-amz-server-side-encryption")).forEach((header) => {
      if (!hoistableHeaders.has(header)) {
        unhoistableHeaders.add(header);
      }
    });
    requestToSign.headers[SHA256_HEADER] = UNSIGNED_PAYLOAD;
    const currentHostHeader = requestToSign.headers.host;
    const port = requestToSign.port;
    const expectedHostHeader = `${requestToSign.hostname}${requestToSign.port != null ? ":" + port : ""}`;
    if (!currentHostHeader || currentHostHeader === requestToSign.hostname && requestToSign.port != null) {
      requestToSign.headers.host = expectedHostHeader;
    }
  }
};

// src/getSignedUrl.ts
var getSignedUrl = /* @__PURE__ */ __name(async (client, command, options = {}) => {
  let s3Presigner;
  let region;
  if (typeof client.config.endpointProvider === "function") {
    const endpointV2 = await (0, import_middleware_endpoint.getEndpointFromInstructions)(
      command.input,
      command.constructor,
      client.config
    );
    const authScheme = endpointV2.properties?.authSchemes?.[0];
    if (authScheme?.name === "sigv4a") {
      region = authScheme?.signingRegionSet?.join(",");
    } else {
      region = authScheme?.signingRegion;
    }
    s3Presigner = new S3RequestPresigner({
      ...client.config,
      signingName: authScheme?.signingName,
      region: /* @__PURE__ */ __name(async () => region, "region")
    });
  } else {
    s3Presigner = new S3RequestPresigner(client.config);
  }
  const presignInterceptMiddleware = /* @__PURE__ */ __name((next, context) => async (args) => {
    const { request } = args;
    if (!import_protocol_http.HttpRequest.isInstance(request)) {
      throw new Error("Request to be presigned is not an valid HTTP request.");
    }
    delete request.headers["amz-sdk-invocation-id"];
    delete request.headers["amz-sdk-request"];
    delete request.headers["x-amz-user-agent"];
    let presigned2;
    const presignerOptions = {
      ...options,
      signingRegion: options.signingRegion ?? context["signing_region"] ?? region,
      signingService: options.signingService ?? context["signing_service"]
    };
    if (context.s3ExpressIdentity) {
      presigned2 = await s3Presigner.presignWithCredentials(request, context.s3ExpressIdentity, presignerOptions);
    } else {
      presigned2 = await s3Presigner.presign(request, presignerOptions);
    }
    return {
      // Intercept the middleware stack by returning fake response
      response: {},
      output: {
        $metadata: { httpStatusCode: 200 },
        presigned: presigned2
      }
    };
  }, "presignInterceptMiddleware");
  const middlewareName = "presignInterceptMiddleware";
  const clientStack = client.middlewareStack.clone();
  clientStack.addRelativeTo(presignInterceptMiddleware, {
    name: middlewareName,
    relation: "before",
    toMiddleware: "awsAuthMiddleware",
    override: true
  });
  const handler = command.resolveMiddleware(clientStack, client.config, {});
  const { output } = await handler({ input: command.input });
  const { presigned } = output;
  return (0, import_util_format_url.formatUrl)(presigned);
}, "getSignedUrl");
// Annotate the CommonJS export names for ESM import in node:

0 && (module.exports = {
  getSignedUrl,
  S3RequestPresigner
});

