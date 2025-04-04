/**
 * The data to accept the invite.
 */
export interface AcceptInviteWorkflowInputDTO {
    /**
     * The invite token.
     */
    invite_token: string;
    /**
     * The ID of the auth identity to associate the user with.
     */
    auth_identity_id: string;
    /**
     * The user to create.
     */
    user: {
        /**
         * The email of the user.
         */
        email?: string;
        /**
         * The first name of the user.
         */
        first_name?: string | null;
        /**
         * The last name of the user.
         */
        last_name?: string | null;
        /**
         * The avatar URL of the user.
         */
        avatar_url?: string | null;
        /**
         * Custom key-value pairs of data to store in the user.
         */
        metadata?: Record<string, unknown> | null;
    };
}
//# sourceMappingURL=accept-invite.d.ts.map