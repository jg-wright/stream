import {
  type Clockable,
  expectTimeline,
  fromTimeline,
} from '@johngw/stream-test'
import assert from 'node:assert'

export { FakeClock } from '@johngw/stream-test'
export { fromTimeline }
export type { Clockable }

export interface AssertTimelineOptions {
  message?: string
  clock?: Clockable
}

export function assertTimeline<T>(
  stream: ReadableStream<T>,
  outputTimeline: string,
  options?: AssertTimelineOptions,
) {
  return stream.pipeTo(
    expectTimeline(
      outputTimeline,
      (timelineValue, chunk, timeline) => {
        try {
          assert.deepStrictEqual(chunk, timelineValue, options?.message)
        } catch (error: any) {
          error.message =
            timeline.displayTimelinePosition() + '\n' + error.message
          throw error
        }
      },
      options,
    ),
  )
}
