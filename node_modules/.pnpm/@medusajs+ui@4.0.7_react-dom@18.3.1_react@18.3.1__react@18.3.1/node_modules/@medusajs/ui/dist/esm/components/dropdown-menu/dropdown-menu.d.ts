import { DropdownMenu as RadixDropdownMenu } from "radix-ui";
import * as React from "react";
declare const DropdownMenu: React.FC<RadixDropdownMenu.DropdownMenuProps> & {
    Trigger: React.ForwardRefExoticComponent<RadixDropdownMenu.DropdownMenuTriggerProps & React.RefAttributes<HTMLButtonElement>>;
    Group: React.ForwardRefExoticComponent<RadixDropdownMenu.DropdownMenuGroupProps & React.RefAttributes<HTMLDivElement>>;
    SubMenu: React.FC<RadixDropdownMenu.DropdownMenuSubProps>;
    SubMenuContent: React.ForwardRefExoticComponent<Omit<RadixDropdownMenu.DropdownMenuSubContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    SubMenuTrigger: React.ForwardRefExoticComponent<Omit<RadixDropdownMenu.DropdownMenuSubTriggerProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Content: React.ForwardRefExoticComponent<Omit<RadixDropdownMenu.DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Item: React.ForwardRefExoticComponent<Omit<RadixDropdownMenu.DropdownMenuItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    CheckboxItem: React.ForwardRefExoticComponent<Omit<RadixDropdownMenu.DropdownMenuCheckboxItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    RadioGroup: React.ForwardRefExoticComponent<RadixDropdownMenu.DropdownMenuRadioGroupProps & React.RefAttributes<HTMLDivElement>>;
    RadioItem: React.ForwardRefExoticComponent<Omit<RadixDropdownMenu.DropdownMenuRadioItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Label: React.ForwardRefExoticComponent<Omit<RadixDropdownMenu.DropdownMenuLabelProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Separator: React.ForwardRefExoticComponent<Omit<RadixDropdownMenu.DropdownMenuSeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Shortcut: {
        ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>): React.JSX.Element;
        displayName: string;
    };
    Hint: {
        ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>): React.JSX.Element;
        displayName: string;
    };
};
export { DropdownMenu };
//# sourceMappingURL=dropdown-menu.d.ts.map