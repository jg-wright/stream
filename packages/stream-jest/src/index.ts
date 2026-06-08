import {
  expectTimeline as $expectTimeline,
  type ExpectTimelineOptions,
  type ParsedTimelineItemValue,
} from '@johngw/stream-test'
import { expect, JestAssertionError, type MatcherContext } from 'expect'
import type { StreamPipeOptions } from 'node:stream/web'

export { FakeClock } from '@johngw/stream-test'
export { fromTimeline } from '@johngw/stream-test'

export function expectTimeline<T>(
  timeline: string,
  options?: ExpectTimelineOptions<T>,
) {
  return $expectTimeline<T>(
    timeline,
    (timelineValue, chunk, timeline) => {
      try {
        expect(chunk).toStrictEqual(timelineValue)
      } catch (error: any) {
        error.message =
          timeline.displayTimelinePosition() + '\n' + error.message
        throw error
      }
    },
    options,
  )
}

expect.extend({
  toMatchTimeline: function toMatchTimeline<T extends ParsedTimelineItemValue>(
    this: MatcherContext,
    stream: ReadableStream<T>,
    timeline: string,
    streamPipeOptions?: StreamPipeOptions & ExpectTimelineOptions<unknown>,
  ) {
    return stream
      .pipeTo(expectTimeline(timeline, streamPipeOptions), streamPipeOptions)
      .then(
        () => ({
          message: () =>
            `expect ${this.utils.printExpected(
              stream,
            )} to match timeline ${timeline}`,
          pass: true,
        }),
        (error: JestAssertionError) => ({
          message: () => error.matcherResult?.message || error.message,
          pass: error.matcherResult?.pass || false,
        }),
      )
  },
})

declare module 'expect' {
  interface Matchers<R> {
    toMatchTimeline(
      timeline: string,
      streamPipeOptions?: StreamPipeOptions & ExpectTimelineOptions<R>,
    ): Promise<R>
  }
}
