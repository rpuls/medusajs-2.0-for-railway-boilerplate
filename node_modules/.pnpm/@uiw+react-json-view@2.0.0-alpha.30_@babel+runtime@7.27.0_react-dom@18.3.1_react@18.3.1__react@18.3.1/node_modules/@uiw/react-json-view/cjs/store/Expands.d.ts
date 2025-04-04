import { FC, PropsWithChildren } from 'react';
type InitialState = {
    [key: string]: boolean;
};
type Dispatch = React.Dispatch<InitialState>;
export declare const useExpandsStore: () => InitialState;
export declare function useExpands(): [{
    [x: string]: boolean;
}, import("react").Dispatch<InitialState>];
export declare function useExpandsDispatch(): Dispatch;
interface ExpandsProps {
    initial: InitialState;
    dispatch: Dispatch;
}
export declare const Expands: FC<PropsWithChildren<ExpandsProps>>;
export {};
