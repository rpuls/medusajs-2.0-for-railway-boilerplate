import { Tabs as RadixTabs } from "radix-ui";
import * as React from "react";
import { ProgressStatus } from "../../types";
interface ProgressTabsTriggerProps extends Omit<React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>, "asChild"> {
    status?: ProgressStatus;
}
declare const ProgressTabs: {
    (props: RadixTabs.TabsProps): React.JSX.Element;
    displayName: string;
} & {
    Trigger: React.ForwardRefExoticComponent<ProgressTabsTriggerProps & React.RefAttributes<HTMLButtonElement>>;
    List: React.ForwardRefExoticComponent<Omit<RadixTabs.TabsListProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Content: React.ForwardRefExoticComponent<Omit<RadixTabs.TabsContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
};
export { ProgressTabs };
//# sourceMappingURL=progress-tabs.d.ts.map