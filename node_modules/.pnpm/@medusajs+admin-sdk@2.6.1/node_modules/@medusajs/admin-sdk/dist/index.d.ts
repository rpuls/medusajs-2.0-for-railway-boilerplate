import { InjectionZone, NestedRoutePosition } from '@medusajs/admin-shared';
import { ComponentType } from 'react';

interface WidgetConfig {
    /**
     * The injection zone or zones that the widget should be injected into.
     */
    zone: InjectionZone | InjectionZone[];
}
interface RouteConfig {
    /**
     * An optional label to display in the sidebar. If not provided, the route will not be displayed in the sidebar.
     */
    label?: string;
    /**
     * An optional icon to display in the sidebar together with the label. If no label is provided, the icon will be ignored.
     */
    icon?: ComponentType;
    /**
     * The nested route to display under existing route in the sidebar.
     */
    nested?: NestedRoutePosition;
}

/**
 * Define a widget configuration.
 *
 * @param config The widget configuration.
 * @returns The widget configuration.
 */
declare function defineWidgetConfig(config: WidgetConfig): WidgetConfig;
/**
 * Define a route configuration.
 *
 * @param config The route configuration.
 * @returns The route configuration.
 */
declare function defineRouteConfig(config: RouteConfig): RouteConfig;

export { type RouteConfig, type WidgetConfig, defineRouteConfig, defineWidgetConfig };
