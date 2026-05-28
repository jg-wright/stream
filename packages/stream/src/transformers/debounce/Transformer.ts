import type { Transformer } from 'node:stream/web'
import type { DebounceBehavior } from './Behavior.js'
import type { DebounceState } from './State.js'

/**
 * The transformer implementation for {@link debounce:function}.
 *
 * @group Transformers
 * @see {@link debounce:function}
 */
export class DebounceTransformer<T> implements Transformer<T, T> {
  #behaviors: DebounceBehavior<T>[]
  #state: DebounceState

  constructor(ms: number, behaviors: DebounceBehavior<T>[]) {
    this.#behaviors = behaviors
    this.#state = this.#reduceState('init', { ms, queued: false })
  }

  transform(chunk: T, controller: TransformStreamDefaultController<T>) {
    this.#preTimer(chunk, controller)
    this.#timer(chunk, controller)
  }

  flush() {
    clearTimeout(this.#state.timer)
  }

  #preTimer(chunk: T, controller: TransformStreamDefaultController<T>) {
    clearTimeout(this.#state.timer)

    this.#state = this.#reduceState(
      'preTimer',
      {
        ...this.#state,
        queued: false,
      },
      chunk,
      controller,
    )
  }

  #timer(chunk: T, controller: TransformStreamDefaultController<T>) {
    this.#state = {
      ...this.#state,

      timer: setTimeout(
        () => this.#postTimer(chunk, controller),
        this.#state.ms,
      ),
    }
  }

  #postTimer(chunk: T, controller: TransformStreamDefaultController<T>) {
    clearTimeout(this.#state.timer)

    this.#state = this.#reduceState(
      'postTimer',
      {
        ...this.#state,
        timer: undefined,
      },
      chunk,
      controller,
    )
  }

  #reduceState(stage: 'init', state: DebounceState): DebounceState

  #reduceState(
    stage: 'preTimer' | 'postTimer',
    state: DebounceState,
    chunk: T,
    controller: TransformStreamDefaultController<T>,
  ): DebounceState

  #reduceState(
    stage: keyof DebounceBehavior<T>,
    state: DebounceState,
    chunk?: T,
    controller?: TransformStreamDefaultController<T>,
  ): DebounceState {
    return this.#behaviors.reduce(
      (state, behavior) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        behavior[stage]?.(state, chunk!, controller!) || state,
      state,
    )
  }
}
