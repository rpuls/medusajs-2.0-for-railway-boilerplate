import { RadioGroup as RadixRadioGroup } from "radix-ui";
import * as React from "react";
interface ChoiceBoxProps extends React.ComponentPropsWithoutRef<typeof RadixRadioGroup.Item> {
    label: string;
    description: string;
}
declare const RadioGroup: React.ForwardRefExoticComponent<Omit<RadixRadioGroup.RadioGroupProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>> & {
    Item: React.ForwardRefExoticComponent<Omit<RadixRadioGroup.RadioGroupItemProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    ChoiceBox: React.ForwardRefExoticComponent<ChoiceBoxProps & React.RefAttributes<HTMLButtonElement>>;
};
export { RadioGroup };
//# sourceMappingURL=radio-group.d.ts.map