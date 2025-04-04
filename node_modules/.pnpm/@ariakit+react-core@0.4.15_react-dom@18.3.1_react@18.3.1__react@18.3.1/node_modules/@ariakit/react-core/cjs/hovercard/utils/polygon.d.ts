export type Point = [number, number];
export type Polygon = Point[];
export declare function getEventPoint(event: MouseEvent): Point;
export declare function isPointInPolygon(point: Point, polygon: Polygon): boolean;
export declare function getElementPolygon(element: Element, enterPoint: Point): Point[];
