export class ToolError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = "ToolError";
    }
}

export function formatErrorResponse(error: unknown) {
    // Format the error response according to the MCP protocol
}
