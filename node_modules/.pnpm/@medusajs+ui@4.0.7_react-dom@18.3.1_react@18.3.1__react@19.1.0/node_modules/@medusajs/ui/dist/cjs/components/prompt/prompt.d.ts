import { AlertDialog as RadixAlertDialog } from "radix-ui";
import * as React from "react";
type PromptVariant = "danger" | "confirmation";
declare const Prompt: {
    ({ variant, ...props }: React.ComponentPropsWithoutRef<typeof RadixAlertDialog.Root> & {
        variant?: PromptVariant;
    }): React.JSX.Element;
    displayName: string;
} & {
    Trigger: React.ForwardRefExoticComponent<RadixAlertDialog.AlertDialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
    Content: React.ForwardRefExoticComponent<Omit<RadixAlertDialog.AlertDialogContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Title: React.ForwardRefExoticComponent<Omit<Omit<RadixAlertDialog.AlertDialogTitleProps & React.RefAttributes<HTMLHeadingElement>, "ref">, "asChild"> & React.RefAttributes<HTMLHeadingElement>>;
    Description: React.ForwardRefExoticComponent<Omit<RadixAlertDialog.AlertDialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>, "ref"> & React.RefAttributes<HTMLParagraphElement>>;
    Action: React.ForwardRefExoticComponent<Omit<Omit<RadixAlertDialog.AlertDialogActionProps & React.RefAttributes<HTMLButtonElement>, "ref">, "asChild"> & React.RefAttributes<HTMLButtonElement>>;
    Cancel: React.ForwardRefExoticComponent<Omit<Omit<RadixAlertDialog.AlertDialogCancelProps & React.RefAttributes<HTMLButtonElement>, "ref">, "asChild"> & React.RefAttributes<HTMLButtonElement>>;
    Header: {
        ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element;
        displayName: string;
    };
    Footer: {
        ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element;
        displayName: string;
    };
};
export { Prompt };
//# sourceMappingURL=prompt.d.ts.map