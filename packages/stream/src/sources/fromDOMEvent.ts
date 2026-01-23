/// <reference lib="DOM" />

/**
 * Creates a readable stream from DOM events.
 *
 * @group Sources
 * @example
 * ```
 * fromDOMEvent(window, 'resize')
 * fromDOMEvent(document, 'click', { capture: true })
 * ```
 *
 * If you're receiving an excessive amount of events and
 * find that some are being dropped, you may wish to
 * increase the high water mark.
 *
 * ```
 * fromDOMEvent(
 *   document.body,
 *   'mousemove',
 *   {},
 *   new CountQueuingStrategy({ highWaterMark: 100 })
 * )
 * ```
 */
export function fromDOMEvent<K extends keyof WindowEventMap>(
  element: Window,
  type: K,
  options?: boolean | AddEventListenerOptions,
  queuingStrategy?: QueuingStrategy<WindowEventMap[K]>
): ReadableStream<WindowEventMap[K]>

export function fromDOMEvent<K extends keyof DocumentEventMap>(
  element: Document,
  type: K,
  options?: boolean | AddEventListenerOptions,
  queuingStrategy?: QueuingStrategy<DocumentEventMap[K]>
): ReadableStream<DocumentEventMap[K]>

export function fromDOMEvent<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  options?: boolean | AddEventListenerOptions,
  queuingStrategy?: QueuingStrategy<HTMLElementEventMap[K]>
): ReadableStream<HTMLElementEventMap[K]>

export function fromDOMEvent(
  element: HTMLElement | Window | Document,
  type: string,
  options?: boolean | AddEventListenerOptions,
  queuingStrategy?: QueuingStrategy<Event>
): ReadableStream<Event>

export function fromDOMEvent(
  element: HTMLElement | Window | Document,
  type: string,
  options?: boolean | AddEventListenerOptions,
  queuingStrategy?: QueuingStrategy
) {
  let handler: (event: Event) => void

  return new ReadableStream(
    {
      start(controller) {
        handler = (event) => {
          if (controller.desiredSize) controller.enqueue(event)
        }
        element.addEventListener(type, handler, options)
      },

      cancel() {
        element.removeEventListener(type, handler, options)
      },
    },
    queuingStrategy
  )
}
