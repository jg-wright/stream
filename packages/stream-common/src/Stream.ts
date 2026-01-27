import type { L } from 'ts-toolbelt'
import { all } from './Async.js'
import { without } from './Array.js'
import type { RequiredProps } from './Object.js'
import type { UnderlyingSink, UnderlyingSource } from 'bun'

/**
 * Something that can be flushed by another stream.
 *
 * @group Utils
 * @category Stream
 */
export interface Flushable {
  flushes?: ReadableStream<unknown>
  /**
   * By default an error in the `flushes` stream will be sent by the transformer.
   */
  ignoreFlushErrors?: boolean
}

/**
 * Using a {@link Flushable} notify when the stream
 * flushes and errors.
 *
 * @group Utils
 * @category Stream
 */
export function pipeFlushes(
  onFlush: () => void | Promise<void>,
  onError: (error: unknown) => unknown,
  options?: Flushable & { signal?: AbortSignal },
) {
  options?.flushes
    ?.pipeTo(new WritableStream({ write: onFlush }), { signal: options.signal })
    .catch(
      options.ignoreFlushErrors
        ? () => {
            // Ignored
          }
        : onError,
    )
}

/**
 * Returns the chunk type of a ReadableStream.
 *
 * @group Utils
 * @category Stream
 * @example
 * ```
 * type T = ReadableStreamChunk<ReadableStream<number>>
 * // number
 * ```
 */
export type ReadableStreamChunk<R extends ReadableStream<unknown>> =
  R extends ReadableStream<infer T> ? T : never

/**
 * Returns the union chunk type of a list of ReadableStreams.
 *
 * @group Utils
 * @category Stream
 * @example
 * ```
 * type T = ReadableStreamsChunk<[ReadableStream<number>, ReadableStream<string>]>
 * // number | string
 * ```
 */
export type ReadableStreamsChunk<RSs extends ReadableStream<unknown>[]> =
  RSs extends ReadableStream<infer T>[] ? T : never

/**
 * Creates a tuple type of the chunk types from a list of
 * ReadableStreams.
 *
 * @group Utils
 * @category Stream
 * @example
 * ```
 * type T = ReadableStreamsChunks<[
 *   ReadableStream<number>,
 *   ReadableStream<string>,
 *   ReadableStream<string>,
 *   ReadableStream<number>,
 * ]>
 * // [number, string, string, number]
 * ```
 */
export type ReadableStreamsChunks<Rs extends ReadableStream<unknown>[]> =
  _ReadableStreamsChunks<Rs, []>

type _ReadableStreamsChunks<
  Rs extends ReadableStream<unknown>[],
  Acc extends unknown[],
> =
  L.Length<Rs> extends 0
    ? Acc
    : _ReadableStreamsChunks<
        L.Tail<Rs>,
        [...Acc, ReadableStreamChunk<L.Head<Rs>>]
      >

/**
 * Creates a ReadableStream that immediately closes.
 *
 * @group Sources
 */
export function immediatelyClosingReadableStream() {
  return new ReadableStream<never>({
    start(controller) {
      controller.close()
    },
  })
}

/**
 * Merges multiple streams in to 1 ReadableStream.
 *
 * Warning: this may create a bottleneck as the highwater mark
 * can easily be breached. This is because every pull will attempt to
 * read and queue at least one chunk from each incoming stream.
 *
 * @group Sources
 * @see {@link roundRobin:function}
 * @example
 * ```
 * merge([
 * --1----2----3-------4-|
 * ---one---two---three---four-|
 * ])
 *
 * -1-one-2-two-3-three-4-four-|
 * ```
 */
export function merge<RSs extends ReadableStream<unknown>[]>(
  readableStreams: RSs,
  queuingStrategy?: QueuingStrategy<ReadableStreamsChunk<RSs>>,
) {
  if (!readableStreams.length) return immediatelyClosingReadableStream()

  let readers = readableStreams.map((stream) => stream.getReader())

  return new ReadableStream<ReadableStreamsChunk<RSs>>(
    {
      pull(controller) {
        // At first glance you may wonder why we're wrapping
        // the Promise.all in another Promise. This is because
        // we have no idea how long each reader is going to
        // take and we may want to fill the desired size before
        // all readers have resolved. Therefore we resolve
        // when the 1st reader queues an item so the stream
        // can request more if it needs.
        return new Promise((resolve) => {
          all(readers, async (reader) => {
            try {
              const result = await reader.read()
              if (result.done) readers = without(readers, reader)
              else {
                controller.enqueue(result.value as ReadableStreamsChunk<RSs>)
                resolve()
              }
            } catch (error) {
              controller.error(error)
              resolve()
            }
          }).finally(() => {
            if (!readers.length) {
              try {
                controller.close()
              } catch (error) {
                // potentially closed already
              }
              resolve()
            }
          })
        })
      },

      async cancel(reason) {
        await all(readers, (reader) => reader.cancel(reason))
      },
    },
    queuingStrategy,
  )
}

/**
 * Consume chunks from a ReadableStream. Syntactical sugar
 * for a simple WritableStream.
 *
 * @group Sinks
 * @example
 * ```
 * readableStream.pipeTo(write(console.info))
 *
 * // ... instead of ...
 *
 * readableStream.pipeTo(new WritableStream({
 *   write(chunk) {
 *     console.info(chunk)
 *   }
 * }))
 * ```
 */
export function write<T>(
  fn?: (chunk: T) => unknown,
  queuingStrategy?: QueuingStrategy<T>,
) {
  return new WritableStream<T>(
    fn && {
      async write(chunk) {
        await fn(chunk)
      },
    },
    queuingStrategy,
  )
}

/**
 * An `UnderlyingSource` object that has a `cancel` method.
 *
 * @group Utils
 * @category Stream
 */
export type CancellableSource<T> = RequiredProps<UnderlyingSource<T>, 'cancel'>

/**
 * A guard to test that an `UnderlyingSource` object that has a `cancel` method.
 *
 * @group Utils
 * @category Stream
 */
export function isCancellableSource<T>(
  source: UnderlyingSource<T>,
): source is CancellableSource<T> {
  return 'cancel' in source
}

/**
 * An `UnderlyingSource` object that has a `pull` method.
 *
 * @group Utils
 * @category Stream
 */
export type PullableSource<T> = RequiredProps<UnderlyingSource<T>, 'pull'>

/**
 * A guard to test that an `UnderlyingSource` object that has a `pull` method.
 *
 * @group Utils
 * @category Stream
 */
export function isPullableSource<T>(
  source: UnderlyingSource<T>,
): source is PullableSource<T> {
  return 'pull' in source
}

/**
 * An `UnderlyingSource` object that has a `start` method.
 *
 * @group Utils
 * @category Stream
 */
export type StartableSource<T> = RequiredProps<UnderlyingSource<T>, 'start'>

/**
 * A guard to test that an `UnderlyingSource` object that has a `start` method.
 *
 * @group Utils
 * @category Stream
 */
export function isStartableSource<T>(
  source: UnderlyingSource<T>,
): source is StartableSource<T> {
  return 'start' in source
}

/**
 * An `UnderlyingSink` object that has an `abort` method.
 *
 * @group Utils
 * @category Stream
 */
export type AbortableSink<T> = RequiredProps<UnderlyingSink<T>, 'abort'>

/**
 * A guard to test that an `UnderlyingSink` object that has an `abort` method.
 *
 * @group Utils
 * @category Stream
 */
export function isAbortableSink<T>(
  sink: UnderlyingSink<T>,
): sink is AbortableSink<T> {
  return 'abort' in sink
}

/**
 * An `UnderlyingSink` object that has a `close` method.
 *
 * @group Utils
 * @category Stream
 */
export type ClosableSink<T> = RequiredProps<UnderlyingSink<T>, 'close'>

/**
 * A guard to test that an `UnderlyingSink` object that has a `close` method.
 *
 * @group Utils
 * @category Stream
 */
export function isClosableSink<T>(
  sink: UnderlyingSink<T>,
): sink is ClosableSink<T> {
  return 'close' in sink
}

/**
 * An `UnderlyingSink` object that has a `start` method.
 *
 * @group Utils
 * @category Stream
 */
export type StartableSink<T> = RequiredProps<UnderlyingSink<T>, 'start'>

/**
 * A guard to test that an `UnderlyingSink` object that has a `start` method.
 *
 * @group Utils
 * @category Stream
 */
export function isStartableSink<T>(
  sink: UnderlyingSink<T>,
): sink is StartableSink<T> {
  return 'start' in sink
}

/**
 * An `UnderlyingSink` object that has a `write` method.
 *
 * @group Utils
 * @category Stream
 */
export type WritableSink<T> = RequiredProps<UnderlyingSink<T>, 'write'>

/**
 * A guard to test that an `UnderlyingSink` object that has a `write` method.
 *
 * @group Utils
 * @category Stream
 */
export function isWritableSink<T>(
  sink: UnderlyingSink<T>,
): sink is WritableSink<T> {
  return 'write' in sink
}
