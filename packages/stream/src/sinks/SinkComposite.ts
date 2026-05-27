import { all } from '@johngw/stream-common/Async'
import {
  type AbortableSink,
  type ClosableSink,
  type StartableSink,
  type WritableSink,
  isAbortableSink,
  isClosableSink,
  isStartableSink,
  isWritableSink,
} from '@johngw/stream-common/Stream'

/**
 * A collection of `UnderlyingSink`s that implement the `UnderlyingSink`.
 *
 * @group Sinks
 * @example
 * ```
 * stream.pipeTo(
 *   new WritableStream(
 *     new SinkComposite([
 *       { write: (chunk) => console.info(`1 ${chunk}`) },
 *       { write: (chunk) => console.info(`2 ${chunk}`) },
 *     ])
 *   )
 * )
 * ```
 */
export class SinkComposite<T> implements UnderlyingSink<T> {
  readonly #abortableSinks: AbortableSink<T>[]
  readonly #closableSinks: ClosableSink<T>[]
  readonly #startableSinks: StartableSink<T>[]
  readonly #writableSinks: WritableSink<T>[]

  constructor(sinks: UnderlyingSink<T>[]) {
    this.#abortableSinks = sinks.filter(isAbortableSink)
    this.#closableSinks = sinks.filter(isClosableSink)
    this.#startableSinks = sinks.filter(isStartableSink)
    this.#writableSinks = sinks.filter(isWritableSink)
  }

  async abort(reason: unknown) {
    await all(this.#abortableSinks, (sink) => sink.abort(reason))
  }

  async close() {
    await all(this.#closableSinks, (sink) => sink.close())
  }

  async start(controller: WritableStreamDefaultController) {
    await all(this.#startableSinks, (sink) => sink.start(controller))
  }

  async write(chunk: T, controller: WritableStreamDefaultController) {
    await all(this.#writableSinks, (sink) => sink.write(chunk, controller))
  }
}
