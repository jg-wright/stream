import {
  expectTimeline as $expectTimeline,
  type ParsedTimelineItemValue,
} from '@johngw/stream-test'
import { expect, JestAssertionError, type MatcherContext } from 'expect'

export { fromTimeline } from '@johngw/stream-test'

export function expectTimeline(timeline: string) {
  return $expectTimeline(timeline, (timelineValue, chunk, timeline) => {
    try {
      expect(chunk).toStrictEqual(timelineValue)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      error.message = timeline.displayTimelinePosition() + '\n' + error.message
      throw error
    }
  })
}

expect.extend({
  toMatchTimeline: function toMatchTimeline<T extends ParsedTimelineItemValue>(
    this: MatcherContext,
    stream: ReadableStream<T>,
    timeline: string,
    streamPipeOptions?: StreamPipeOptions
  ) {
    return stream.pipeTo(expectTimeline(timeline), streamPipeOptions).then(
      () => ({
        message: () =>
          `expect ${this.utils.printExpected(
            stream
          )} to match timeline ${timeline}`,
        pass: true,
      }),
      (error: JestAssertionError) => ({
        message: () => error.matcherResult?.message || error.message,
        pass: error.matcherResult?.pass || false,
      })
    )
  },
})

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchTimeline(
        timeline: string,
        streamPipeOptions?: StreamPipeOptions
      ): Promise<R>
    }
  }
}
