export interface BaseFile {
    id: string;
    url: string;
}
export type BaseUploadFile = {
    files: ({
        name: string;
        content: string;
    } | File)[];
} | FileList;
//# sourceMappingURL=common.d.ts.map