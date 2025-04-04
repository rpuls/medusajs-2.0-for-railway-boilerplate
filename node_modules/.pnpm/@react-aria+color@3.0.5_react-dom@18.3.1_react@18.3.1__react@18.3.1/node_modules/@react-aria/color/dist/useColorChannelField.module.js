import {useNumberField as $5aC6d$useNumberField} from "@react-aria/numberfield";
import {useLocale as $5aC6d$useLocale} from "@react-aria/i18n";

/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 

function $5e632d1ff0188f00$export$e55dd820142d3131(props, state, inputRef) {
    let { locale: locale } = (0, $5aC6d$useLocale)();
    return (0, $5aC6d$useNumberField)({
        ...props,
        value: undefined,
        defaultValue: undefined,
        onChange: undefined,
        validate: undefined,
        // Provide a default aria-label if no other label is provided.
        'aria-label': props['aria-label'] || (props.label || props['aria-labelledby'] ? undefined : state.colorValue.getChannelName(props.channel, locale))
    }, state, inputRef);
}


export {$5e632d1ff0188f00$export$e55dd820142d3131 as useColorChannelField};
//# sourceMappingURL=useColorChannelField.module.js.map
