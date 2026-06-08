/**
 * The DebounceState is passed to each {@link DebounceBehavior:interface} stage.
 *
 * @group Transformers
 * @see {@link DebounceBehavior:interface}
 * @see {@link debounce:function}
 */
export type DebounceState = Readonly<{
  /**
   * Whether or not the current chunk was queued to the next Readable.
   */
  queued: boolean
  /**
   * The current amount of milliseconds the timer will use.
   */
  ms: number
  /**
   * The timer Id/handle.
   */
  timer?: number | NodeJS.Timeout
}>
