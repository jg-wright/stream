import { all } from '@johngw/stream-common/Async'
import {
  type CancellableSource,
  type PullableSource,
  type StartableSource,
  isCancellableSource,
  isPullableSource,
  isStartableSource,
} from '@johngw/stream-common/Stream'
import type { UnderlyingDefaultSource } from 'node:stream/web'

/**
 * A collection of `UnderlyingDefaultSource`s that implement the `UnderlyingDefaultSource`.
 *
 * @group Sources
 * @example
 * ```
 * new ReadableStream(
 *   new SourceComposite([
 *     { start: (controller) => controller.enqueue('Hello') },
 *     { start: (controller) => controller.enqueue('World') },
 *   ])
 * )
 * ```
 */
export class SourceComposite<T> implements UnderlyingDefaultSource<T> {
  readonly #cancellableSources: CancellableSource<T>[]
  readonly #pullableSources: PullableSource<T>[]
  readonly #startableSources: StartableSource<T>[]

  constructor(sources: UnderlyingDefaultSource<T>[]) {
    this.#cancellableSources = sources.filter(isCancellableSource)
    this.#pullableSources = sources.filter(isPullableSource)
    this.#startableSources = sources.filter(isStartableSource)
  }

  async cancel(reason: unknown) {
    await all(this.#cancellableSources, (source) => source.cancel(reason))
  }

  async pull(controller: ReadableStreamDefaultController<T>) {
    await all(this.#pullableSources, (source) => source.pull(controller))
  }

  async start(controller: ReadableStreamDefaultController<T>) {
    await all(this.#startableSources, (source) => source.start(controller))
  }
}
