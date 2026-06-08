/**
 * Transforms nothing.
 *
 * @group Transformers
 * @example
 * ```
 * --a--b--c--d--
 *
 * identity()
 *
 * --a--b--c--d--
 * ```
 */
export function identity<T>() {
  return new TransformStream<T, T>()
}
