"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.FetchError = exports.PUBLISHABLE_KEY_HEADER = void 0;
const fetch_event_stream_1 = require("fetch-event-stream");
const qs_1 = require("qs");
exports.PUBLISHABLE_KEY_HEADER = "x-publishable-api-key";
// We want to explicitly retrieve the base URL instead of relying on relative paths that differ in behavior between browsers.
const getBaseUrl = (passedBaseUrl) => {
    if (typeof window === "undefined") {
        return passedBaseUrl;
    }
    // If the passed base URL is empty or "/", we use the current origin from the browser.
    if (passedBaseUrl === "" || passedBaseUrl === "/") {
        return window.location.origin;
    }
    return passedBaseUrl;
};
const hasStorage = (storage) => {
    if (typeof window !== "undefined") {
        return storage in window;
    }
    return false;
};
const toBase64 = (str) => {
    if (typeof window !== "undefined") {
        return window.btoa(str);
    }
    return Buffer.from(str).toString("base64");
};
const sanitizeHeaders = (headers) => {
    return {
        ...Object.fromEntries(headers.entries()),
        authorization: "<REDACTED>",
    };
};
const normalizeRequest = (init, headers, config) => {
    let body = init?.body;
    if (body && headers.get("content-type")?.includes("application/json")) {
        body = JSON.stringify(body);
    }
    // "credentials" is not supported in some environments (eg. on the backend), and it might throw an exception if the field is set.
    const isFetchCredentialsSupported = "credentials" in Request.prototype;
    // Oftentimes the server will be on a different origin, so we want to default to include
    // Note that the cookie's SameSite attribute takes precedence over this setting.
    const credentials = config.auth?.type === "session"
        ? config.auth?.fetchCredentials || "include"
        : "omit";
    return {
        ...init,
        headers,
        credentials: isFetchCredentialsSupported ? credentials : undefined,
        ...(body ? { body: body } : {}),
    };
};
const normalizeResponse = async (resp, reqHeaders) => {
    if (resp.status >= 300) {
        const jsonError = (await resp.json().catch(() => ({})));
        throw new FetchError(jsonError.message ?? resp.statusText, resp.statusText, resp.status);
    }
    // If we requested JSON, we try to parse the response. Otherwise, we return the raw response.
    const isJsonRequest = reqHeaders.get("accept")?.includes("application/json");
    return isJsonRequest ? await resp.json() : resp;
};
class FetchError extends Error {
    constructor(message, statusText, status) {
        super(message);
        this.statusText = statusText;
        this.status = status;
    }
}
exports.FetchError = FetchError;
class Client {
    constructor(config) {
        this.DEFAULT_JWT_STORAGE_KEY = "medusa_auth_token";
        this.token = "";
        this.getApiKeyHeader_ = () => {
            return this.config.apiKey
                ? { Authorization: "Basic " + toBase64(this.config.apiKey + ":") }
                : {};
        };
        this.getPublishableKeyHeader_ = () => {
            return this.config.publishableKey
                ? { [exports.PUBLISHABLE_KEY_HEADER]: this.config.publishableKey }
                : {};
        };
        this.getTokenStorageInfo_ = () => {
            const hasLocal = hasStorage("localStorage");
            const hasSession = hasStorage("sessionStorage");
            const hasCustom = Boolean(this.config.auth?.storage);
            const storageMethod = this.config.auth?.jwtTokenStorageMethod ||
                (hasLocal ? "local" : "nostore");
            const storageKey = this.config.auth?.jwtTokenStorageKey || this.DEFAULT_JWT_STORAGE_KEY;
            if (!hasLocal && storageMethod === "local") {
                this.throwError_("Local JWT storage is only available in the browser");
            }
            if (!hasSession && storageMethod === "session") {
                this.throwError_("Session JWT storage is only available in the browser");
            }
            if (!hasCustom && storageMethod === "custom") {
                this.throwError_("Custom storage was not provided in the config");
            }
            return {
                storageMethod,
                storageKey,
            };
        };
        this.config = { ...config, baseUrl: getBaseUrl(config.baseUrl) };
        const logger = config.logger || {
            error: console.error,
            warn: console.warn,
            info: console.info,
            debug: console.debug,
        };
        this.logger = {
            ...logger,
            debug: config.debug ? logger.debug : () => { },
        };
        this.fetch_ = this.initClient();
    }
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
    fetch(input, init) {
        return this.fetch_(input, init);
    }
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
    async fetchStream(input, init) {
        const abortController = new AbortController();
        const abortFunc = abortController.abort.bind(abortController);
        let res = await this.fetch_(input, {
            ...init,
            signal: abortController.signal,
            headers: { ...init?.headers, accept: "text/event-stream" },
        });
        if (res.ok) {
            return { stream: (0, fetch_event_stream_1.events)(res, abortController.signal), abort: abortFunc };
        }
        return { stream: null, abort: abortFunc };
    }
    async setToken(token) {
        await this.setToken_(token);
    }
    async clearToken() {
        await this.clearToken_();
    }
    async clearToken_() {
        const { storageMethod, storageKey } = this.getTokenStorageInfo_();
        switch (storageMethod) {
            case "local": {
                window.localStorage.removeItem(storageKey);
                break;
            }
            case "session": {
                window.sessionStorage.removeItem(storageKey);
                break;
            }
            case "custom": {
                await this.config.auth?.storage?.removeItem(storageKey);
                break;
            }
            case "memory": {
                this.token = "";
                break;
            }
        }
    }
    initClient() {
        const defaultHeaders = new Headers({
            "content-type": "application/json",
            accept: "application/json",
            ...this.getApiKeyHeader_(),
            ...this.getPublishableKeyHeader_(),
        });
        this.logger.debug("Initiating Medusa client with default headers:\n", `${JSON.stringify(sanitizeHeaders(defaultHeaders), null, 2)}\n`);
        return async (input, init) => {
            // We always want to fetch the up-to-date JWT token before firing off a request.
            const headers = new Headers(defaultHeaders);
            const customHeaders = {
                ...this.config.globalHeaders,
                ...(await this.getJwtHeader_()),
                ...init?.headers,
            };
            // We use `headers.set` in order to ensure headers are overwritten in a case-insensitive manner.
            Object.entries(customHeaders).forEach(([key, value]) => {
                if (value === null) {
                    headers.delete(key);
                }
                else {
                    headers.set(key, value);
                }
            });
            let normalizedInput = input;
            if (input instanceof URL || typeof input === "string") {
                const baseUrl = new URL(this.config.baseUrl);
                const fullPath = `${baseUrl.pathname.replace(/\/$/, "")}/${input
                    .toString()
                    .replace(/^\//, "")}`;
                normalizedInput = new URL(fullPath, baseUrl.origin);
                if (init?.query) {
                    const params = Object.fromEntries(normalizedInput.searchParams.entries());
                    const stringifiedQuery = (0, qs_1.stringify)({ ...params, ...init.query });
                    normalizedInput.search = stringifiedQuery;
                }
            }
            this.logger.debug("Performing request to:\n", `URL: ${normalizedInput.toString()}\n`, `Headers: ${JSON.stringify(sanitizeHeaders(headers), null, 2)}\n`);
            // Any non-request errors (eg. invalid JSON in the response) will be thrown as-is.
            return await fetch(normalizedInput, normalizeRequest(init, headers, this.config)).then((resp) => {
                this.logger.debug(`Received response with status ${resp.status}\n`);
                return normalizeResponse(resp, headers);
            });
        };
    }
    async getJwtHeader_() {
        // If the user has requested for session storage, we don't want to send the JWT token in the header.
        if (this.config.auth?.type === "session") {
            return {};
        }
        const token = await this.getToken_();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
    async setToken_(token) {
        const { storageMethod, storageKey } = this.getTokenStorageInfo_();
        switch (storageMethod) {
            case "local": {
                window.localStorage.setItem(storageKey, token);
                break;
            }
            case "session": {
                window.sessionStorage.setItem(storageKey, token);
                break;
            }
            case "custom": {
                await this.config.auth?.storage?.setItem(storageKey, token);
                break;
            }
            case "memory": {
                this.token = token;
                break;
            }
        }
    }
    async getToken_() {
        const { storageMethod, storageKey } = this.getTokenStorageInfo_();
        switch (storageMethod) {
            case "local": {
                return window.localStorage.getItem(storageKey);
            }
            case "session": {
                return window.sessionStorage.getItem(storageKey);
            }
            case "custom": {
                return await this.config.auth?.storage?.getItem(storageKey);
            }
            case "memory": {
                return this.token;
            }
        }
        return null;
    }
    throwError_(message) {
        this.logger.error(message);
        throw new Error(message);
    }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map