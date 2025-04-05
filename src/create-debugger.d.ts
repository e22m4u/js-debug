/**
 * Debugger.
 */
export type Debugger = (messageOrData: unknown, ...args: any[]) => void;

/**
 * Create debugger.
 *
 * @param namespace
 */
export declare function createDebugger(namespace: string): Debugger;
