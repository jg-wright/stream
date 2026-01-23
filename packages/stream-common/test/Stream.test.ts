import { test } from 'bun:test'
import type {
  ReadableStreamChunk,
  ReadableStreamsChunk,
  ReadableStreamsChunks,
} from '../src/Stream'
import { check, checks, type Fail, type Pass } from '../src/Test'

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
          ReadableStream<number>
        ]
      >,
      [number, string, string, number],
      Pass
    >(),

    check<ReadableStreamsChunks<[]>, [], Pass>(),
  ])
})
