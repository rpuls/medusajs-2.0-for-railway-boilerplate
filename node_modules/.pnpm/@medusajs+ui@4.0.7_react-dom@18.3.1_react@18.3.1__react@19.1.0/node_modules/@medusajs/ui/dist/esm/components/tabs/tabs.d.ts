import { Tabs as RadixTabs } from "radix-ui";
import * as React from "react";
declare const Tabs: {
    (props: React.ComponentPropsWithoutRef<typeof RadixTabs.Root>): React.JSX.Element;
    displayName: string;
} & {
    Trigger: React.ForwardRefExoticComponent<Omit<RadixTabs.TabsTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    List: React.ForwardRefExoticComponent<Omit<RadixTabs.TabsListProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Content: React.ForwardRefExoticComponent<Omit<RadixTabs.TabsContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
};
export { Tabs };
//# sourceMappingURL=tabs.d.ts.map