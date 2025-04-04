import { FC, PropsWithChildren } from 'react';
type InitialState = Record<string, boolean>;
type Dispatch = React.Dispatch<InitialState>;
export declare const useShowToolsStore: () => InitialState;
export declare function useShowTools(): [{
    [x: string]: boolean;
}, import("react").Dispatch<InitialState>];
export declare function useShowToolsDispatch(): Dispatch;
interface ShowToolsProps {
    initial: InitialState;
    dispatch: Dispatch;
}
export declare const ShowTools: FC<PropsWithChildren<ShowToolsProps>>;
export {};
