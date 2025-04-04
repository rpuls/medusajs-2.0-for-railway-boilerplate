import React from 'react';
export interface ContainerProps<T extends object> extends React.HTMLAttributes<HTMLDivElement> {
    keyName?: string | number;
    keyid?: string;
    parentValue?: T;
    level?: number;
    value?: T;
    initialValue?: T;
    /** Index of the parent `keyName` */
    keys?: (string | number)[];
}
export declare const Container: React.ForwardRefExoticComponent<ContainerProps<object> & React.RefAttributes<HTMLDivElement>>;
