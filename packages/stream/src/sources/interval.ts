/**
 * Continuously emits `Date` chunks until cancelled.
 *
 * @group Sources
 * @example
 * ```
 * interval(1_000)
 *
 * ------<Date>------<Date>------
 * ```
 */
export function interval(ms: number, queuingStrategy?: QueuingStrategy<Date>) {
  let timer: NodeJS.Timeout

  return new ReadableStream<Date>(
    {
      start(controller) {
        timer = setInterval(() => {
          if (controller.desiredSize) controller.enqueue(new Date())
        }, ms)
      },

      cancel() {
        clearInterval(timer)
      },
    },
    queuingStrategy
  )
}
