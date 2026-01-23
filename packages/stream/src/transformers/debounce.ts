import type { DebounceBehavior } from '#transformers/debounce/Behavior'
import { DebounceTransformer } from '#transformers/debounce/Transformer'
import { DebounceTrailingBehavior } from '#transformers/debounce/TrailingBehavior'

export { type DebounceBehavior, DebounceTrailingBehavior }
export * from '#transformers/debounce/BackOffBehavior'
export * from '#transformers/debounce/State'
export * from '#transformers/debounce/LeadingBehavior'

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
  behaviors?: DebounceBehavior<T> | DebounceBehavior<T>[]
) {
  return new TransformStream<T, T>(
    new DebounceTransformer(
      ms,
      !behaviors
        ? [new DebounceTrailingBehavior()]
        : Array.isArray(behaviors)
        ? behaviors
        : [behaviors]
    )
  )
}
