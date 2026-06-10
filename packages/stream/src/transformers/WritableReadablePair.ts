import { overrideObject } from '@johngw/stream-common/Object'
import type {
  ReadableWritablePair,
  UnderlyingDefaultSource,
  UnderlyingSink,
} from 'node:stream/web'

export interface WritableReadablePairSink<W, R> extends Omit<
  UnderlyingSink<W>,
  'write'
> {
  write?(
    chunk: W,
    readableController: ReadableStreamDefaultController<R>,
    writableController: WritableStreamDefaultController,
  ): void | PromiseLike<void>
}

/**
 * A much less abstract version of the {@see TransformStream} that lets you interact
 * with both the `Readable` and `Writable` side of the stream.
 *
 * @remarks
 * We're implementing the {@see ReadableWritablePair} interface here, but the name
 * `WritableReadablePair` is closer to the truth. Chunks are first given to the `WritableStream`
 * which is then read from the `ReadableStream`.
 */
export class WritableReadablePair<W, R> implements ReadableWritablePair<R, W> {
  readonly writable: WritableStream<W>
  readonly readable: ReadableStream<R>

  #writableController!: WritableStreamDefaultController
  #proxiedWritableController!: WritableStreamDefaultController
  #readableController!: ReadableStreamDefaultController<R>
  #proxiedReadableController!: ReadableStreamDefaultController<R>

  constructor(
    sink: WritableReadablePairSink<W, R> = {},
    source: UnderlyingDefaultSource<R> = {},
    {
      readableStrategy = new CountQueuingStrategy({ highWaterMark: 0 }),
      writableStrategy,
    }: {
      readableStrategy?: QueuingStrategy<R>
      writableStrategy?: QueuingStrategy<W>
    } = {},
  ) {
    this.writable = new WritableStream<W>(
      {
        start: async (controller) => {
          this.#writableController = controller

          this.#proxiedWritableController = overrideObject(controller, {
            error: (controller, reason) => {
              controller.error(reason)
              this.#readableController.error(reason)
            },
          })

          await sink.start?.(this.#proxiedWritableController)
        },

        abort: async (reason: unknown) => {
          await sink.abort?.(reason)
          this.#readableController.error(reason)
        },

        close: async () => {
          await sink.close?.()
          this.#readableController.close()
        },

        write: (chunk) =>
          sink.write?.(
            chunk,
            this.#proxiedReadableController,
            this.#proxiedWritableController,
          ),
      },
      writableStrategy,
    )

    this.readable = new ReadableStream<R>(
      {
        start: async (controller) => {
          this.#readableController = controller

          this.#proxiedReadableController = overrideObject(controller, {
            close: (controller) => {
              controller.close()
              this.#writableController.error(
                new Error('Readable side was closed'),
              )
            },
            error: (controller, reason) => {
              controller.error(reason)
              this.#writableController.error(reason)
            },
          })

          await source.start?.(this.#proxiedReadableController)
        },

        cancel: async (reason) => {
          await source.cancel?.(reason)
          this.#writableController.error(reason)
        },

        pull: () => source.pull?.(this.#proxiedReadableController),
      },
      readableStrategy,
    )
  }
}
