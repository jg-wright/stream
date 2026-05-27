/// <reference lib="DOM" />

/**
 * Creates a ReadableStream from DOM Intersections.
 *
 * @group Sources
 * @example
 * ```
 * const observe = fromDOMIntersections(
 *   {
 *     root: document.querySelector("#scrollArea"),
 *     rootMargin: "0px",
 *     threshold: 1.0,
 *   }
 * )
 *
 * observe(document.querySelector("#listItem")).pipeTo(
 *   write(console.info)
 * )
 * ```
 *
 * If the queue is full when receiving DOM intersctions, you
 * may notice some events being dropped. To avoid this you
 * will need to increase the high water mark.
 *
 * ```
 * const observe = fromDOMIntersections(
 *   {
 *     root: document.querySelector("#scrollArea"),
 *     rootMargin: "0px",
 *     threshold: 1.0,
 *   },
 *   new CountQueuingStrategy({ highWaterMark: 10 })
 * )
 *
 * observe(document.querySelector("#listItem")).pipeTo(
 *   write(console.info)
 * )
 * ```
 */
export function fromDOMIntersections(
  options?: IntersectionObserverInit,
  queuingStrategy?: QueuingStrategy<IntersectionObserverEntry>
) {
  const controllers = new WeakMap<
    Element,
    ReadableStreamDefaultController<IntersectionObserverEntry>
  >()

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const controller = controllers.get(entry.target)
      if (controller?.desiredSize) controller.enqueue(entry)
    }
  }, options)

  return (
    target: Element,
    targetQueuingStrategy:
      | QueuingStrategy<IntersectionObserverEntry>
      | undefined = queuingStrategy
  ) =>
    new ReadableStream<IntersectionObserverEntry>(
      {
        start(controller) {
          controllers.set(target, controller)
          observer.observe(target)
        },
        cancel() {
          observer.unobserve(target)
          controllers.delete(target)
        },
      },
      targetQueuingStrategy
    )
}
