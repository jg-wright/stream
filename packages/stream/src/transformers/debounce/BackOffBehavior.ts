import type { DebounceBehavior } from './Behavior.js'
import type { DebounceState } from './State.js'

/**
 * @group Transformers
 */
export interface DebounceBackOffBehaviorOptions {
  /**
   * The back-off increment formular
   */
  inc(currentMS: number): number

  /**
   * An optional maximum time to reach.
   *
   * @default Number.MAX_SAFE_INTEGER
   */
  max?: number
}

/**
 * A behavior that will increase the debounce time whenever events
 * are received within the current time. It's best to be used in
 * conjunction with the {@link DebounceTrailingBehavior:class}
 * or the {@link DebounceLeadingBehavior:class}.
 *
 * @group Transformers
 * @see {@link debounce:function}
 * @example
 * --a--b---c----d----|
 *
 * debounce(5, [
 *   new DebounceBackOffBehavior({ inc: (ms) => ms * 2 }),
 *   new DebounceTrailingBehavior(),
 * ])
 *
 * --T5-T10-T20--T40-d-
 */
export class DebounceBackOffBehavior<T> implements DebounceBehavior<T> {
  #inc: (currentMS: number) => number
  #max: number
  #startingMS = 0

  constructor({
    inc,
    max = Number.MAX_SAFE_INTEGER,
  }: DebounceBackOffBehaviorOptions) {
    this.#inc = inc
    this.#max = max
  }

  init(state: DebounceState) {
    this.#startingMS = state.ms
  }

  preTimer(state: DebounceState) {
    return state.timer
      ? {
          ...state,
          ms: Math.min(this.#inc(state.ms), this.#max),
        }
      : {
          ...state,
          ms: this.#startingMS,
        }
  }
}
