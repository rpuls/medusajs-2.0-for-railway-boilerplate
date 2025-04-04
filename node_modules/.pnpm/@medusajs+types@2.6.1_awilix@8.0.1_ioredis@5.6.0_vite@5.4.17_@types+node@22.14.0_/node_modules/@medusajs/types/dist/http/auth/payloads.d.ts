export interface AdminSignUpWithEmailPassword {
    email: string;
    password: string;
}
export interface AdminSignInWithEmailPassword extends AdminSignUpWithEmailPassword {
}
export interface AdminUpdateProvider {
    [key: string]: unknown;
}
//# sourceMappingURL=payloads.d.ts.map