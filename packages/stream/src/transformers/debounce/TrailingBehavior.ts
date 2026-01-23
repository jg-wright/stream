import type { DebounceBehavior } from './Behavior'
import type { DebounceState } from './State'

/**
 * Debouncing behavior to queue the trailing event.
 *
 * @group Transformers
 * @see {@link debounce:function}
 * @example
 * ```
 * --a----T20--b-c----T20--d------|
 *
 * debounce(20)
 * // Same as...
 * debounce(20, new DebounceTrailingBehavior())
 *
 * ---T20-a------T20-c------T20-d--
 * ```
 */
export class DebounceTrailingBehavior<T> implements DebounceBehavior<T> {
  postTimer(
    state: DebounceState,
    chunk: T,
    controller: TransformStreamDefaultController<T>
  ): DebounceState | void {
    const enqueue = !state.queued
    if (enqueue) {
      controller.enqueue(chunk)
      return {
        ...state,
        queued: enqueue,
      }
    }
  }
}
