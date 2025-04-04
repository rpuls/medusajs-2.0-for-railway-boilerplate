import { Popover as RadixPopover } from "radix-ui";
import * as React from "react";
interface ContentProps extends React.ComponentPropsWithoutRef<typeof RadixPopover.Content> {
}
declare const Popover: {
    (props: React.ComponentPropsWithoutRef<typeof RadixPopover.Root>): React.JSX.Element;
    displayName: string;
} & {
    Trigger: React.ForwardRefExoticComponent<Omit<RadixPopover.PopoverTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    Anchor: React.ForwardRefExoticComponent<Omit<RadixPopover.PopoverAnchorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Close: React.ForwardRefExoticComponent<Omit<RadixPopover.PopoverCloseProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    Content: React.ForwardRefExoticComponent<ContentProps & React.RefAttributes<HTMLDivElement>>;
    Seperator: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
};
export { Popover };
//# sourceMappingURL=popover.d.ts.map