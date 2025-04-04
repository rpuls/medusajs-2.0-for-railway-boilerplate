import {useLink as $iYMrm$useLink} from "@react-aria/link";

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 
function $dafd15390222438a$export$452b38fce62c9384(props, ref) {
    let { isCurrent: isCurrent, isDisabled: isDisabled, 'aria-current': ariaCurrent, elementType: elementType = 'a', ...otherProps } = props;
    let { linkProps: linkProps } = (0, $iYMrm$useLink)({
        isDisabled: isDisabled || isCurrent,
        elementType: elementType,
        ...otherProps
    }, ref);
    let isHeading = /^h[1-6]$/.test(elementType);
    let itemProps = {};
    if (!isHeading) itemProps = linkProps;
    if (isCurrent) {
        itemProps['aria-current'] = ariaCurrent || 'page';
        // isCurrent sets isDisabled === true for the current item,
        // so we have to restore the tabIndex in order to support autoFocus.
        itemProps.tabIndex = props.autoFocus ? -1 : undefined;
    }
    return {
        itemProps: {
            'aria-disabled': isDisabled,
            ...itemProps
        }
    };
}


export {$dafd15390222438a$export$452b38fce62c9384 as useBreadcrumbItem};
//# sourceMappingURL=useBreadcrumbItem.module.js.map
