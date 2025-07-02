import { z, ZodAny, ZodType } from "zod";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export type ToolDefinition<T, R extends ZodType, O> = {
    name: string;
    description: string;
    inputSchema: T;
    handler: (input: InferToolHandlerInput<T, R>) => Promise<O>;
};

export type InferToolHandlerInput<T, X extends ZodType> = {
    [K in keyof T]: z.infer<X>;
};

export const defineTool = (
    cb: (zod: typeof z) => ToolDefinition<any, ZodAny, any>
) => {
    const tool = cb(z);

    const wrappedHandler = async (
        input: InferToolHandlerInput<Zod.ZodAny, Zod.ZodAny>,
        _: RequestHandlerExtra
    ): Promise<{
        content: CallToolResult["content"];
        isError?: boolean;
        statusCode?: number;
    }> => {
        try {
            const result = await tool.handler(input);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${
                            error instanceof Error
                                ? error.message
                                : String(error)
                        }`
                    }
                ],
                isError: true
            };
        }
    };

    return {
        ...tool,
        handler: wrappedHandler
    };
};
