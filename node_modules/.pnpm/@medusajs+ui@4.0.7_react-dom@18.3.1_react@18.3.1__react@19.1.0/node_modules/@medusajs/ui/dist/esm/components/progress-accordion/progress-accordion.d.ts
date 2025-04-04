import { Accordion as RadixAccordion } from "radix-ui";
import * as React from "react";
import { ProgressStatus } from "../../types";
interface HeaderProps extends React.ComponentPropsWithoutRef<typeof RadixAccordion.Header> {
    status?: ProgressStatus;
}
declare const ProgressAccordion: {
    (props: React.ComponentPropsWithoutRef<typeof RadixAccordion.Root>): React.JSX.Element;
    displayName: string;
} & {
    Item: React.ForwardRefExoticComponent<Omit<RadixAccordion.AccordionItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Header: React.ForwardRefExoticComponent<HeaderProps & React.RefAttributes<HTMLHeadingElement>>;
    Content: React.ForwardRefExoticComponent<Omit<RadixAccordion.AccordionContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
};
export { ProgressAccordion };
//# sourceMappingURL=progress-accordion.d.ts.map