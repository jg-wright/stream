import type { ReadableStreamsChunks } from '@johngw/stream-common/Stream'
import { empty } from '@johngw/stream-common/Symbol'
import { ControllableSource } from '../sources/ControllableSource.js'
import { SourceComposite } from '../sources/SourceComposite.js'

/**
 * Combines the source Observable with other Observables to create an Observable
 * whose values are calculated from the latest values of each, only when the source emits.
 *
 * @group Transformers
 * @example
 * ```
 * --a-----b-------c---d---e--
 *
 * withLatestFrom(
 * -----1----2-3-4------------
 * )
 *
 * --------b1------c4--d4--e4-
 * ```
 */
export function withLatestFrom<T, RSs extends ReadableStream<unknown>[]>(
  ...inputs: RSs
): ReadableWritablePair<[T, ...ReadableStreamsChunks<RSs>], T> {
  const abortController = new AbortController()

  const isFilled = (arr: unknown[]): arr is ReadableStreamsChunks<RSs> =>
    arr.every((value) => value !== empty)

  const inputValues: unknown[] = inputs.map(() => empty)

  inputs.forEach((input, index) =>
    input
      .pipeTo(
        new WritableStream({
          abort(reason) {
            console.info('ABORTING')
            abortController.abort(reason)
          },
          write(chunk) {
            inputValues[index] = chunk
          },
        }),
        { signal: abortController.signal },
      )
      .catch((error) => {
        console.error('ERROR!', error)
      }),
  )

  const controller = new ControllableSource<
    [T, ...ReadableStreamsChunks<RSs>]
  >()

  const readable = new ReadableStream<[T, ...ReadableStreamsChunks<RSs>]>(
    new SourceComposite([
      controller,
      {
        start,

        cancel(reason) {
          abortController.abort(reason)
        },
      },
    ]),
  )

  const writable = new WritableStream<T>({
    start,

    write(chunk) {
      if (isFilled(inputValues)) controller.enqueue([chunk, ...inputValues])
    },

    abort(reason) {
      abortController.abort(reason)
    },

    close() {
      controller.close()
    },
  })

  return { readable, writable }

  function start(
    controller:
      | ReadableStreamDefaultController<[T, ...ReadableStreamsChunks<RSs>]>
      | WritableStreamDefaultController,
  ) {
    const onAbort = () => controller.error(abortController.signal.reason)
    abortController.signal.addEventListener('abort', onAbort)
  }
}
