import { describe, test } from 'node:test'
import type {
  ReadableStreamChunk,
  ReadableStreamsChunk,
  ReadableStreamsChunks,
} from '@johngw/stream-common/Stream'
import { check, checks, type Fail, type Pass } from '@johngw/stream-common/Test'

describe('Stream', () => {
  test('ReadableStreamChunk', () => {
    checks([
      check<ReadableStreamChunk<ReadableStream<number>>, number, Pass>(),

      check<ReadableStreamChunk<ReadableStream<null>>, null, Pass>(),

      check<ReadableStreamChunk<ReadableStream<{ foo: string }>>, null, Fail>(),
    ])
  })

  test('ReadableStreamsChunk', () => {
    checks([
      check<
        ReadableStreamsChunk<[ReadableStream<string>, ReadableStream<number>]>,
        string | number,
        Pass
      >(),
    ])
  })

  test('ReadableStreamsChunks', () => {
    checks([
      check<
        ReadableStreamsChunks<
          [
            ReadableStream<number>,
            ReadableStream<string>,
            ReadableStream<string>,
            ReadableStream<number>,
          ]
        >,
        [number, string, string, number],
        Pass
      >(),

      check<ReadableStreamsChunks<[]>, [], Pass>(),
    ])
  })
})
