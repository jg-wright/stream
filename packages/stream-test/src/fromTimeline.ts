import { assertNever } from 'assert-never'
import {
  type ParsedTimelineItemValue,
  Timeline,
} from '@johngw/timeline/Timeline'
import { TimelineItemBoolean } from '@johngw/timeline/TimelineItemBoolean'
import { TimelineItemClose } from '@johngw/timeline/TimelineItemClose'
import { TimelineItemDash } from '@johngw/timeline/TimelineItemDash'
import { TimelineItemDefault } from '@johngw/timeline/TimelineItemDefault'
import { TimelineItemError } from '@johngw/timeline/TimelineItemError'
import { TimelineItemInstance } from '@johngw/timeline/TimelineItemInstance'
import { TimelineItemNeverReach } from '@johngw/timeline/TimelineItemNeverReach'
import { TimelineItemNull } from '@johngw/timeline/TimelineItemNull'
import { TimelineItemTimer } from '@johngw/timeline/TimelineItemTimer'
import type { Clockable } from '@johngw/timeline/Clock'

export interface FromTimelineOptions<T> {
  clock?: Clockable
  queuingStrategy?: QueuingStrategy<T>
}

/**
 * Creates a ReadableStream from a "timeline".
 *
 * @see [timeline docs](/stream/timelines)
 * @see {@link expectTimeline:function}
 * @group Sources
 * @example
 * ```
 * fromTimeline('--1--2--3--4--')
 *   .pipeTo(write(console.info))
 * // 1
 * // 2
 * // 3
 * // 4
 * ```
 *
 * Each dash is considered a timeout of 1ms.
 *
 * ```
 * merge([
 *   fromTimeline('--1---2---3---4--'),
 *   fromTimeline('----a---b---c----'),
 * ])
 *   .pipeTo(write(console.info))
 * // 1
 * // a
 * // 2
 * // b
 * // 3
 * // c
 * // 4
 * ```
 */
export function fromTimeline<T extends ParsedTimelineItemValue>(
  timelineString: string,
  options?: FromTimelineOptions<T>,
): ReadableStream<T> {
  const timeline = Timeline.create(timelineString, options)

  return new ReadableStream<T>(
    {
      async pull(controller) {
        const { done, value } = await timeline.next()

        if (done || value instanceof TimelineItemClose) {
          return controller.close()
        } else if (value instanceof TimelineItemDash) {
          return this.pull!(controller)
        } else if (
          value instanceof TimelineItemError ||
          value instanceof TimelineItemNeverReach
        ) {
          return controller.error(value.get())
        } else if (value instanceof TimelineItemTimer) {
          // Passing the timer advances the clock by its full duration
          // (see TimelineItemTimer.onPass), so just move on. Awaiting the
          // timer's promise here would deadlock on a virtual clock —
          // nothing advances the clock while we're blocked on it.
          return this.pull!(controller)
        } else if (value instanceof TimelineItemInstance) {
          const Class = new Function(`return class ${value.get().name} {}`)()
          return controller.enqueue(new Class())
        } else if (
          value instanceof TimelineItemDefault ||
          value instanceof TimelineItemBoolean ||
          value instanceof TimelineItemNull
        ) {
          return controller.enqueue(value.get() as T)
        } else {
          assertNever(value)
        }
      },
    },
    options?.queuingStrategy,
  )
}
