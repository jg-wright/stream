/// <reference lib="DOM" />

/**
 * Creates a ReadableStream from DOM mutations.
 *
 * @group Sources
 * @see {@link addedNodes:function}
 * @see {@link removedNodes:function}
 * @example
 * ```
 * fromDOMMutations(document.body, { childList: true })
 *   .pipeTo(write((mutation) => {
 *     console.info(mutation.addedNodes)
 *   }))
 * ```
 *
 * If the queue is full when receiving DOM mutations, you
 * may notice some events being dropped. To avoid this you
 * will need to increase the high water mark.
 *
 * ```
 * fromDOMMutations(
 *   document.body,
 *   { childList: true },
 *   new CountQueuingStrategy({ highWaterMark: 10 })
 * )
 *   .pipeThrough(addedNodes())
 *   .pipeTo(
 *     write(console.info),
 *     new CountQueuingStrategy({ highWaterMark: 50 })
 *   )
 * ```
 */
export function fromDOMMutations(
  target: Node,
  options?: MutationObserverInit,
  queuingStrategy?: QueuingStrategy<MutationRecord>
) {
  let observer: MutationObserver

  return new ReadableStream<MutationRecord>(
    {
      start(controller) {
        observer = new MutationObserver((mutations) => {
          for (const mutation of mutations)
            if (controller.desiredSize) controller.enqueue(mutation)
        })

        observer.observe(target, options)
      },

      cancel() {
        observer.disconnect()
      },
    },
    queuingStrategy
  )
}
