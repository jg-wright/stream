import { expectTimeline as $expectTimeline } from '@johngw/stream-test'
import { expect, type CustomMatcher } from 'bun:test'

export { fromTimeline } from '@johngw/stream-test'

export function expectTimeline(timeline: string) {
  return $expectTimeline(timeline, (timelineValue, chunk, timeline) => {
    try {
      expect(chunk).toStrictEqual(timelineValue)
    } catch (error: any) {
      error.message = timeline.displayTimelinePosition() + '\n' + error.message
      throw error
    }
  })
}

const toMatchTimeline: CustomMatcher<
  unknown,
  [timeline: string, streamPipeOptions?: StreamPipeOptions]
> = function toMatchTimeline(stream, timeline, streamPipeOptions) {
  if (!(stream instanceof ReadableStream))
    throw new Error(
      'expect.toMatchTimeline() can only be used with a ReadableStream instance'
    )
  return stream.pipeTo(expectTimeline(timeline), streamPipeOptions).then(
    () => ({
      message: () =>
        `expect ${this.utils.printExpected(
          stream
        )} to match timeline ${timeline}`,
      pass: true,
    }),
    (error) => ({
      message: () => error.matcherResult?.message || error.message,
      pass: error.matcherResult?.pass || false,
    })
  )
}

expect.extend({
  toMatchTimeline,
})

declare module 'bun:test' {
  interface Matchers<T> {
    toMatchTimeline(
      timeline: string,
      streamPipeOptions?: StreamPipeOptions
    ): Promise<T>
  }
}
