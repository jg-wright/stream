import { without } from '@johngw/stream-common/Array'
import { all } from '@johngw/stream-common/Async'
import {
  immediatelyClosingReadableStream,
  type ReadableStreamsChunk,
} from '@johngw/stream-common/Stream'
import { IteratorSource } from './fromCollection.js'
import { SourceComposite } from './SourceComposite.js'

/**
 * Given an ordered list of streams, queue their items from one stream at a time.
 *
 * @group Sources
 * @see {@link merge:function}
 * @example
 * ```
 * roundRobin([
 * --1------2------3------4-------
 * ----one-two--three-------------
 * ])
 *
 * --1-one--2-two--3-three-4------
 * ```
 */
export function roundRobin<RSs extends ReadableStream<unknown>[]>(
  streams: RSs,
  queuingStrategy?: QueuingStrategy<ReadableStreamsChunk<RSs>>,
): ReadableStream<ReadableStreamsChunk<RSs>> {
  let readers = streams.map((stream) => stream.getReader())

  return !streams.length
    ? (immediatelyClosingReadableStream() as ReadableStream<never>)
    : new ReadableStream(
        new SourceComposite([
          new IteratorSource(generateReadResults()),
          {
            async cancel(reason) {
              await all(readers, (reader) => reader.cancel(reason))
            },
          },
        ]),
        queuingStrategy,
      )

  async function* generateReadResults() {
    let index = 0

    while (readers.length) {
      if (!(index in readers)) index = 0
      const reader = readers[index]
      if (!reader) break
      const result = await reader.read()
      if (result.done) readers = without(readers, reader)
      else {
        yield result.value
        index++
      }
    }
  }
}
