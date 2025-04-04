import { Context, CreateFileDTO, FileDTO, FileTypes, FilterableFileProps, FindConfig, ModuleJoinerConfig } from "@medusajs/framework/types";
import FileProviderService from "./file-provider-service";
type InjectedDependencies = {
    fileProviderService: FileProviderService;
};
export default class FileModuleService implements FileTypes.IFileModuleService {
    protected readonly fileProviderService_: FileProviderService;
    constructor({ fileProviderService }: InjectedDependencies);
    __joinerConfig(): ModuleJoinerConfig;
    createFiles(data: CreateFileDTO[], sharedContext?: Context): Promise<FileDTO[]>;
    createFiles(data: CreateFileDTO, sharedContext?: Context): Promise<FileDTO>;
    deleteFiles(ids: string[], sharedContext?: Context): Promise<void>;
    deleteFiles(id: string, sharedContext?: Context): Promise<void>;
    retrieveFile(id: string): Promise<FileDTO>;
    listFiles(filters?: FilterableFileProps, config?: FindConfig<FileDTO>, sharedContext?: Context): Promise<FileDTO[]>;
    listAndCountFiles(filters?: FilterableFileProps, config?: FindConfig<FileDTO>, sharedContext?: Context): Promise<[FileDTO[], number]>;
}
export {};
//# sourceMappingURL=file-module-service.d.ts.map