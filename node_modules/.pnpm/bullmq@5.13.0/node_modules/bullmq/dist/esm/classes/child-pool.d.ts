import { Child } from './child';
interface ChildPoolOpts {
    mainFile?: string;
    useWorkerThreads?: boolean;
}
export declare class ChildPool {
    retained: {
        [key: number]: Child;
    };
    free: {
        [key: string]: Child[];
    };
    private opts;
    constructor({ mainFile, useWorkerThreads, }: ChildPoolOpts);
    retain(processFile: string): Promise<Child>;
    release(child: Child): void;
    remove(child: Child): void;
    kill(child: Child, signal?: 'SIGTERM' | 'SIGKILL'): Promise<void>;
    clean(): Promise<void>;
    getFree(id: string): Child[];
    getAllFree(): Child[];
}
export {};
