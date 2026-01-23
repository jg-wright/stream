import { timeout } from '@johngw/stream-common/Async'
import {
  type ParsedTimelineItem,
  type ParsedTimelineItemValue,
  Timeline,
} from '@johngw/timeline/Timeline'
import { TimelineItemDash } from '@johngw/timeline/TimelineItemDash'
import { TimelineItemClose } from '@johngw/timeline/TimelineItemClose'
import { TimelineItemError } from '@johngw/timeline/TimelineItemError'
import { TimelineItemInstance } from '@johngw/timeline/TimelineItemInstance'
import { TimelineItemNeverReach } from '@johngw/timeline/TimelineItemNeverReach'
import {
  TimelineItemTimer,
  TimelineTimer,
} from '@johngw/timeline/TimelineItemTimer'
import { TimelineItemDefault } from '@johngw/timeline/TimelineItemDefault'
import { TimelineItemBoolean } from '@johngw/timeline/TimelineItemBoolean'
import { TimelineItemNull } from '@johngw/timeline/TimelineItemNull'
import { assertNever } from 'assert-never'

/**
 * Calls an expectation function to compare a timeline against chunks.
 *
 * @see [timeline docs](/stream/timelines)
 * @see {@link fromTimeline:function}
 * @group Sinks
 * @example
 * ```
 * fromTimeline(`
 *   --1--2--3--4--
 * `)
 *   .pipeTo(expectTimeline(
 *     `
 *   --1--2--3--4--
 *     `,
 *     (expectation, chunk) =>
 *       expect(chunk).toBe(expectation)
 *   ))
 * ```
 */
export function expectTimeline<T extends ParsedTimelineItemValue>(
  timelineString: string,
  testExcpectation: (
    timelineValue: T,
    chunk: unknown,
    timeline: Timeline
  ) => void | Promise<void>,
  queuingStrategy?: QueuingStrategy<T>
) {
  const timeline = Timeline.create(timelineString)
  let nextResult: Promise<IteratorResult<ParsedTimelineItem, undefined>>

  return new WritableStream<T>(
    {
      start(controller) {
        nextResult = next(controller)
      },

      async close() {
        if (timeline.hasUnfinishedItems())
          throw new TimelineExpectedMoreValuesError(
            timeline,
            await timeline.toTimeline()
          )
      },

      async write(chunk, controller) {
        const { done, value } = await nextResult

        if (done) {
          return controller.error(
            new TimelineReceivedExtraValueError(timeline, chunk)
          )
        } else if (value instanceof TimelineItemDash) {
          //
        } else if (value instanceof TimelineItemClose) {
          return controller.error(new TimelineEarlyCloseError(timeline))
        } else if (
          value instanceof TimelineItemError ||
          value instanceof TimelineItemNeverReach
        ) {
          return controller.error(value.get())
        } else if (value instanceof TimelineItemTimer) {
          const timer = value.get()
          await timeout()
          if (!timer.finished)
            controller.error(new TimelineTimerError(timeline, timer))
          nextResult = next(controller)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return this.write!(chunk, controller)
        } else if (value instanceof TimelineItemInstance) {
          if (
            typeof chunk !== 'object' ||
            chunk === null ||
            chunk.constructor.name !== value.get().name
          )
            controller.error(
              new TimelineError(
                timeline,
                `chunk is not instance of ${value.get().name}`
              )
            )
        } else if (
          value instanceof TimelineItemDefault ||
          value instanceof TimelineItemBoolean ||
          value instanceof TimelineItemNull
        ) {
          await testExcpectation(value.get() as T, chunk, timeline)
        } else {
          assertNever(value)
        }

        nextResult = next(controller)
      },
    },
    queuingStrategy
  )

  async function next(
    controller: WritableStreamDefaultController
  ): Promise<IteratorResult<ParsedTimelineItem>> {
    return timeline.next().then((result) => {
      if (result.value instanceof TimelineItemError)
        controller.error(result.value.get())
      else if (result.value instanceof TimelineItemDash) return next(controller)
      return result
    })
  }
}

class TimelineError extends Error {
  constructor(timeline: Timeline, message: string) {
    super(`${message}

${timeline.displayTimelinePosition()}
`)
  }
}

class TimelineExpectedMoreValuesError extends TimelineError {
  constructor(timeline: Timeline, rest: string) {
    super(timeline, `There are more expectations left.\n${rest}`)
  }
}

class TimelineReceivedExtraValueError extends TimelineError {
  constructor(timeline: Timeline, chunk: ParsedTimelineItemValue) {
    super(
      timeline,
      `Received a value after the expected timeline:\n${JSON.stringify(
        chunk,
        null,
        2
      )}`
    )
  }
}

class TimelineEarlyCloseError extends TimelineError {
  constructor(timeline: Timeline) {
    super(timeline, 'The writer received a signal to close the stream')
  }
}

class TimelineTimerError extends TimelineError {
  constructor(timeline: Timeline, timer: TimelineTimer) {
    let timeLeft = timer.timeLeft
    if (timeLeft === undefined) timeLeft = timer.ms
    super(
      timeline,
      `Expected ${timer.ms}ms timer to have finished. There is ${timeLeft}ms left.`
    )
  }
}
