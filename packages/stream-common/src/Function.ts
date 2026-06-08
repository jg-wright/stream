/**
 * @group Utils
 * @category Function
 */
export interface Accumulator<I, O> {
  (accumulation: O, chunk: I): O | Promise<O>
}

/**
 * @group Utils
 * @category Function
 */
export interface Predicate<T> {
  (chunk: T): boolean | Promise<boolean>
}
