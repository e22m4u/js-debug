/**
 * A function type without class and constructor.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Callable<T = unknown> = (...args: any[]) => T;