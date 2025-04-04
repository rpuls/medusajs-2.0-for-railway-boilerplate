import { ClientFetch, Config, FetchArgs, FetchInput, FetchStreamResponse } from "./types";
export declare const PUBLISHABLE_KEY_HEADER = "x-publishable-api-key";
export declare class FetchError extends Error {
    status: number | undefined;
    statusText: string | undefined;
    constructor(message: string, statusText?: string, status?: number);
}
export declare class Client {
    fetch_: ClientFetch;
    private config;
    private logger;
    private DEFAULT_JWT_STORAGE_KEY;
    private token;
    constructor(config: Config);
    /**
     * `fetch` closely follows (and uses under the hood) the native `fetch` API. There are, however, few key differences:
     * - Non 2xx statuses throw a `FetchError` with the status code as the `status` property, rather than resolving the promise
     * - You can pass `body` and `query` as objects, and they will be encoded and stringified.
     * - The response gets parsed as JSON if the `accept` header is set to `application/json`, otherwise the raw Response object is returned
     *
     * Since the response is dynamically determined, we cannot know if it is JSON or not. Therefore, it is important to pass `Response` as the return type
     *
     * @param input: FetchInput
     * @param init: FetchArgs
     * @returns Promise<T>
     */
    fetch<T extends any>(input: FetchInput, init?: FetchArgs): Promise<T>;
    /**
     * `fetchStream` is a helper method to deal with server-sent events. It returns an object with a stream and an abort function.
     * It follows a very similar interface to `fetch`, with the return value being an async generator.
     * The stream is an async generator that yields `ServerSentEventMessage` objects, which contains the event name, stringified data, and few other properties.
     * The caller is responsible for handling `disconnect` events and aborting the stream. The caller is also responsible for parsing the data field.
     *
     * @param input: FetchInput
     * @param init: FetchArgs
     * @returns FetchStreamResponse
     */
    fetchStream(input: FetchInput, init?: FetchArgs): Promise<FetchStreamResponse>;
    setToken(token: string): Promise<void>;
    clearToken(): Promise<void>;
    protected clearToken_(): Promise<void>;
    protected initClient(): ClientFetch;
    protected getApiKeyHeader_: () => {
        Authorization: string;
    } | {};
    protected getPublishableKeyHeader_: () => {
        [PUBLISHABLE_KEY_HEADER]: string;
    } | {};
    protected getJwtHeader_(): Promise<{
        Authorization: string;
    } | {}>;
    protected setToken_(token: string): Promise<void>;
    protected getToken_(): Promise<string | null | undefined>;
    protected getTokenStorageInfo_: () => {
        storageMethod: "session" | "local" | "memory" | "custom" | "nostore";
        storageKey: string;
    };
    protected throwError_(message: string): void;
}
//# sourceMappingURL=client.d.ts.map