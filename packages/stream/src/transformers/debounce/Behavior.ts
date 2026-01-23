import type { DebounceState } from './State.js'

/**
 * Debouncing requires at least one behavior that implements
 * the DebounceBehavior.
 *
 * @group Transformers
 * @see {@link debounce:function}
 */
export interface DebounceBehavior<T> {
  /**
   * Called only once, when the debouncer is constructed.
   */
  init?(state: DebounceState): DebounceState | void

  /**
   * This is will be called once for every chunk received and before
   * the timer has been set.
   */
  preTimer?(
    state: DebounceState,
    chunk: T,
    controller: TransformStreamDefaultController<T>,
  ): DebounceState | void

  /**
   * Called after timer has timed out.
   */
  postTimer?(
    state: DebounceState,
    chunk: T,
    controller: TransformStreamDefaultController<T>,
  ): DebounceState | void
}
