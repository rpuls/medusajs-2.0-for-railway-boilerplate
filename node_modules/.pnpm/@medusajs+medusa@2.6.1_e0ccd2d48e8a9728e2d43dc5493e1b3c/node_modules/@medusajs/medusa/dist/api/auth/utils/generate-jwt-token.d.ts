import { AuthIdentityDTO } from "@medusajs/framework/types";
export declare function generateJwtTokenForAuthIdentity({ authIdentity, actorType, }: {
    authIdentity: AuthIdentityDTO;
    actorType: string;
}, { secret, expiresIn, }: {
    secret: string | undefined;
    expiresIn: string | undefined;
}): string;
//# sourceMappingURL=generate-jwt-token.d.ts.map