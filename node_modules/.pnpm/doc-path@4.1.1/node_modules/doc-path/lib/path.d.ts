/**
 * Main function that evaluates the path in a particular object
 * @throws {Error} possible error if call stack size is exceeded
 */
export declare function evaluatePath(obj: unknown, kp: string): unknown;
/**
 * Main function that performs validation before passing off to _sp
 * @throws {Error} possible error if call stack size is exceeded
 */
export declare function setPath<T>(obj: T, kp: string, v: unknown): T;
