type Assertiveness = 'assertive' | 'polite';
type Message = string | {
    'aria-labelledby': string;
};
/**
 * Announces the message using screen reader technology.
 */
export function announce(message: Message, assertiveness?: Assertiveness, timeout?: number): void;
/**
 * Stops all queued announcements.
 */
export function clearAnnouncer(assertiveness: Assertiveness): void;
/**
 * Removes the announcer from the DOM.
 */
export function destroyAnnouncer(): void;

//# sourceMappingURL=types.d.ts.map
