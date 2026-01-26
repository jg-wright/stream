import type { DebounceBehavior } from './debounce/Behavior'
import { DebounceTransformer } from './debounce/Transformer'
import { DebounceTrailingBehavior } from './debounce/TrailingBehavior'

export { type DebounceBehavior, DebounceTrailingBehavior }
export * from './debounce/BackOffBehavior'
export * from './debounce/State'
export * from './debounce/LeadingBehavior'

/**
 * Delays queuing until after `ms` milliseconds have elapsed
 * since the last time this transformer received anything.
 * The queuing behavior is configurable.
 *
 * @see {@link DebounceLeadingBehavior:class}
 * @see {@link DebounceTrailingBehavior:class}
 * @see {@link DebounceBackOffBehavior:class}
 * @group Transformers
 * @example
 * Using the trailing behavior.
 * ```
 * --a-b-c--------------d-----------
 *
 * debounce(20)
 * // Same as...
 * debounce(20, new DebounceTrailingBehavior())
 *
 * -------------c---------------d---
 * ```
 *
 * @example
 * Using the leading behavior.
 * ```
 * --a-b-c--------------d-----------
 *
 * debounce(20, new DebounceLeadingBehavior())
 *
 * ---a------------------d----------
 * ```
 *
 * @example
 * Using both leading and trailing behaviors
 * ```
 * --a-b-c--------------d-----------
 *
 * debounce(20, [
 *   new DebounceLeadingBehavior(),
 *   new DebounceTrailingBehavior()
 *])
 *
 * ---a----------c--------d----------
 * ```
 */
export function debounce<T>(
  ms: number,
  behaviors?: DebounceBehavior<T> | DebounceBehavior<T>[],
) {
  return new TransformStream<T, T>(
    new DebounceTransformer(
      ms,
      !behaviors
        ? [new DebounceTrailingBehavior()]
        : Array.isArray(behaviors)
          ? behaviors
          : [behaviors],
    ),
  )
}
