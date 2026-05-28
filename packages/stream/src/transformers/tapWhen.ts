import type { ReadableWritablePair, UnderlyingSink } from 'node:stream/web'
import { WritableReadablePair } from './WritableReadablePair.js'

/**
 * Creates a {@see WritableReadablePair} that gives chunks to the `sink` when
 * when `predicate` passes. It will pass **all** chunks to the readable side.
 *
 * @remarks
 * A good way to signal that a sink is targeted to specific chunk types.
 *
 * @example
 * ```
 * myStream()
 *   .pipeThrough(tapWhen(isMyChunk, { write(myChunk) {} }))
 * ```
 */
export function tapWhen<I, C extends I>(
  predicate: (chunk: I) => chunk is C,
  sink: UnderlyingSink<C>,
): ReadableWritablePair<I, I> {
  return new WritableReadablePair({
    ...sink,

    async write(chunk, readableController, writableController) {
      if (predicate(chunk)) await sink.write?.(chunk, writableController)
      readableController.enqueue(chunk)
    },
  })
}
