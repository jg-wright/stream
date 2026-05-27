import { expectTimeline, fromTimeline } from '@johngw/stream-test'
import assert from 'node:assert'

export { fromTimeline }

export function assertTimeline<T>(
  stream: ReadableStream<T>,
  outputTimeline: string,
  message?: string,
) {
  return stream.pipeTo(
    expectTimeline(outputTimeline, (timelineValue, chunk, timeline) => {
      try {
        assert.deepStrictEqual(chunk, timelineValue, message)
      } catch (error: any) {
        error.message =
          timeline.displayTimelinePosition() + '\n' + error.message
        throw error
      }
    }),
  )
}
