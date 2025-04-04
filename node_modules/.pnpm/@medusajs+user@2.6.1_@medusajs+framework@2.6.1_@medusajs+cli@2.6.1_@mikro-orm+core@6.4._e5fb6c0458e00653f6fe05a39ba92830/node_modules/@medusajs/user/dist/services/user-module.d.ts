import { Context, DAL, InferEntityType, InternalModuleDeclaration, ModulesSdkTypes, UserTypes } from "@medusajs/framework/types";
import { Invite, User } from "../models";
type InjectedDependencies = {
    baseRepository: DAL.RepositoryService;
    userService: ModulesSdkTypes.IMedusaInternalService<any>;
    inviteService: ModulesSdkTypes.IMedusaInternalService<any>;
};
declare const UserModuleService_base: import("@medusajs/framework/utils").MedusaServiceReturnType<{
    User: {
        dto: UserTypes.UserDTO;
    };
    Invite: {
        dto: UserTypes.InviteDTO;
    };
}>;
export default class UserModuleService extends UserModuleService_base implements UserTypes.IUserModuleService {
    protected readonly moduleDeclaration: InternalModuleDeclaration;
    protected baseRepository_: DAL.RepositoryService;
    protected readonly userService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof User>>;
    protected readonly inviteService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof Invite>>;
    protected readonly config: {
        jwtSecret: string;
        expiresIn: number;
    };
    constructor({ userService, inviteService, baseRepository }: InjectedDependencies, moduleDeclaration: InternalModuleDeclaration);
    validateInviteToken(token: string, sharedContext?: Context): Promise<UserTypes.InviteDTO>;
    refreshInviteTokens(inviteIds: string[], sharedContext?: Context): Promise<UserTypes.InviteDTO[]>;
    refreshInviteTokens_(inviteIds: string[], sharedContext?: Context): Promise<{
        id: string;
        email: string;
        accepted: boolean;
        token: string;
        expires_at: Date;
        metadata: Record<string, unknown> | null;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }[]>;
    createUsers(data: UserTypes.CreateUserDTO[], sharedContext?: Context): Promise<UserTypes.UserDTO[]>;
    createUsers(data: UserTypes.CreateUserDTO, sharedContext?: Context): Promise<UserTypes.UserDTO>;
    updateUsers(data: UserTypes.UpdateUserDTO[], sharedContext?: Context): Promise<UserTypes.UserDTO[]>;
    updateUsers(data: UserTypes.UpdateUserDTO, sharedContext?: Context): Promise<UserTypes.UserDTO>;
    createInvites(data: UserTypes.CreateInviteDTO[], sharedContext?: Context): Promise<UserTypes.InviteDTO[]>;
    createInvites(data: UserTypes.CreateInviteDTO, sharedContext?: Context): Promise<UserTypes.InviteDTO>;
    private createInvites_;
    updateInvites(data: UserTypes.UpdateInviteDTO[], sharedContext?: Context): Promise<UserTypes.InviteDTO[]>;
    updateInvites(data: UserTypes.UpdateInviteDTO, sharedContext?: Context): Promise<UserTypes.InviteDTO>;
    private generateToken;
}
export {};
//# sourceMappingURL=user-module.d.ts.map