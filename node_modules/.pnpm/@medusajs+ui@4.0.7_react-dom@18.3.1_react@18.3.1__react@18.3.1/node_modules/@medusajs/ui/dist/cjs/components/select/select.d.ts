import { Select as RadixSelect } from "radix-ui";
import * as React from "react";
interface SelectProps extends React.ComponentPropsWithoutRef<typeof RadixSelect.Root> {
    size?: "base" | "small";
}
interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof RadixSelect.Content> {
}
declare const Select: {
    ({ children, size, ...props }: SelectProps): React.JSX.Element;
    displayName: string;
} & {
    Group: React.ForwardRefExoticComponent<RadixSelect.SelectGroupProps & React.RefAttributes<HTMLDivElement>>;
    Value: React.ForwardRefExoticComponent<RadixSelect.SelectValueProps & React.RefAttributes<HTMLSpanElement>>;
    Trigger: React.ForwardRefExoticComponent<Omit<RadixSelect.SelectTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    Content: React.ForwardRefExoticComponent<SelectContentProps & React.RefAttributes<HTMLDivElement>>;
    Label: React.ForwardRefExoticComponent<Omit<RadixSelect.SelectLabelProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Item: React.ForwardRefExoticComponent<Omit<RadixSelect.SelectItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Separator: React.ForwardRefExoticComponent<Omit<RadixSelect.SelectSeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
};
export { Select };
//# sourceMappingURL=select.d.ts.map