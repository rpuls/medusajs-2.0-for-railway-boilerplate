var $085250522aa37816$exports = require("./intlStrings.main.js");
var $kbAeD$reactariautils = require("@react-aria/utils");
var $kbAeD$reactariai18n = require("@react-aria/i18n");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useGridSelectionCheckbox", () => $d8385f73d3701365$export$70e2eed1a92976ad);



function $d8385f73d3701365$export$70e2eed1a92976ad(props, state) {
    let { key: key } = props;
    let manager = state.selectionManager;
    let checkboxId = (0, $kbAeD$reactariautils.useId)();
    let isDisabled = !state.selectionManager.canSelectItem(key);
    let isSelected = state.selectionManager.isSelected(key);
    // Checkbox should always toggle selection, regardless of selectionBehavior.
    let onChange = ()=>manager.toggleSelection(key);
    const stringFormatter = (0, $kbAeD$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($085250522aa37816$exports))), '@react-aria/grid');
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


//# sourceMappingURL=useGridSelectionCheckbox.main.js.map
