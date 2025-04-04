import $fkdHx$intlStringsmodulejs from "./intlStrings.module.js";
import {useId as $fkdHx$useId} from "@react-aria/utils";
import {useLocalizedStringFormatter as $fkdHx$useLocalizedStringFormatter} from "@react-aria/i18n";


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}



function $7cb39d07f245a780$export$70e2eed1a92976ad(props, state) {
    let { key: key } = props;
    let manager = state.selectionManager;
    let checkboxId = (0, $fkdHx$useId)();
    let isDisabled = !state.selectionManager.canSelectItem(key);
    let isSelected = state.selectionManager.isSelected(key);
    // Checkbox should always toggle selection, regardless of selectionBehavior.
    let onChange = ()=>manager.toggleSelection(key);
    const stringFormatter = (0, $fkdHx$useLocalizedStringFormatter)((0, ($parcel$interopDefault($fkdHx$intlStringsmodulejs))), '@react-aria/grid');
    return {
        checkboxProps: {
            id: checkboxId,
            'aria-label': stringFormatter.format('select'),
            isSelected: isSelected,
            isDisabled: isDisabled,
            onChange: onChange
        }
    };
}


export {$7cb39d07f245a780$export$70e2eed1a92976ad as useGridSelectionCheckbox};
//# sourceMappingURL=useGridSelectionCheckbox.module.js.map
