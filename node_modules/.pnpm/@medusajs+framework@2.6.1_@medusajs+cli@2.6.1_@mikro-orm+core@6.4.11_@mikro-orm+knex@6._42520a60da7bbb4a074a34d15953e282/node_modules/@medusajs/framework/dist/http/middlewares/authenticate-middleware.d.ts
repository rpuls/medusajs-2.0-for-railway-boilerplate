import { RequestHandler } from "express";
import { AuthContext } from "../types";
declare const SESSION_AUTH = "session";
declare const BEARER_AUTH = "bearer";
declare const API_KEY_AUTH = "api-key";
export type AuthType = typeof SESSION_AUTH | typeof BEARER_AUTH | typeof API_KEY_AUTH;
export declare const authenticate: (actorType: string | string[], authType: AuthType | AuthType[], options?: {
    allowUnauthenticated?: boolean;
    allowUnregistered?: boolean;
}) => RequestHandler;
export declare const getAuthContextFromJwtToken: (authHeader: string | undefined, jwtSecret: string, authTypes: AuthType[], actorTypes: string[]) => AuthContext | null;
export {};
//# sourceMappingURL=authenticate-middleware.d.ts.map