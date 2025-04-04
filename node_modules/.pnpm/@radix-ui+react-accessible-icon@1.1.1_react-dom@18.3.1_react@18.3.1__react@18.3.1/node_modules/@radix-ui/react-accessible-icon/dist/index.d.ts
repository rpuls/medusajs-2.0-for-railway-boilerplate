import * as React from 'react';

interface AccessibleIconProps {
    children?: React.ReactNode;
    /**
     * The accessible label for the icon. This label will be visually hidden but announced to screen
     * reader users, similar to `alt` text for `img` tags.
     */
    label: string;
}
declare const AccessibleIcon: React.FC<AccessibleIconProps>;
declare const Root: React.FC<AccessibleIconProps>;

export { AccessibleIcon, type AccessibleIconProps, Root };
