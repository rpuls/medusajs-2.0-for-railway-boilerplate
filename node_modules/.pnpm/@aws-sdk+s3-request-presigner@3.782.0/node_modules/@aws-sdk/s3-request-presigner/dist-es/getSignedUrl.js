import { formatUrl } from "@aws-sdk/util-format-url";
import { getEndpointFromInstructions } from "@smithy/middleware-endpoint";
import { HttpRequest } from "@smithy/protocol-http";
import { S3RequestPresigner } from "./presigner";
export const getSignedUrl = async (client, command, options = {}) => {
    let s3Presigner;
    let region;
    if (typeof client.config.endpointProvider === "function") {
        const endpointV2 = await getEndpointFromInstructions(command.input, command.constructor, client.config);
        const authScheme = endpointV2.properties?.authSchemes?.[0];
        if (authScheme?.name === "sigv4a") {
            region = authScheme?.signingRegionSet?.join(",");
        }
        else {
            region = authScheme?.signingRegion;
        }
        s3Presigner = new S3RequestPresigner({
            ...client.config,
            signingName: authScheme?.signingName,
            region: async () => region,
        });
    }
    else {
        s3Presigner = new S3RequestPresigner(client.config);
    }
    const presignInterceptMiddleware = (next, context) => async (args) => {
        const { request } = args;
        if (!HttpRequest.isInstance(request)) {
            throw new Error("Request to be presigned is not an valid HTTP request.");
        }
        delete request.headers["amz-sdk-invocation-id"];
        delete request.headers["amz-sdk-request"];
        delete request.headers["x-amz-user-agent"];
        let presigned;
        const presignerOptions = {
            ...options,
            signingRegion: options.signingRegion ?? context["signing_region"] ?? region,
            signingService: options.signingService ?? context["signing_service"],
        };
        if (context.s3ExpressIdentity) {
            presigned = await s3Presigner.presignWithCredentials(request, context.s3ExpressIdentity, presignerOptions);
        }
        else {
            presigned = await s3Presigner.presign(request, presignerOptions);
        }
        return {
            response: {},
            output: {
                $metadata: { httpStatusCode: 200 },
                presigned,
            },
        };
    };
    const middlewareName = "presignInterceptMiddleware";
    const clientStack = client.middlewareStack.clone();
    clientStack.addRelativeTo(presignInterceptMiddleware, {
        name: middlewareName,
        relation: "before",
        toMiddleware: "awsAuthMiddleware",
        override: true,
    });
    const handler = command.resolveMiddleware(clientStack, client.config, {});
    const { output } = await handler({ input: command.input });
    const { presigned } = output;
    return formatUrl(presigned);
};
