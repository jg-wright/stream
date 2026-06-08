import { assertTimeline, fromTimeline } from '@johngw/stream-assert'
import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { tapWhen } from '@johngw/stream/transformers/tapWhen'
import { describe, test, type TestContext } from 'node:test'

type A = { type: 'a'; value: number }
type B = { type: 'b'; value: string }
type AB = A | B

const isA = (chunk: AB): chunk is A => chunk.type === 'a'

describe('tapWhen', () => {
  test('passes all chunks through to the readable side', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -1-2-3-4-|
      `).pipeThrough(tapWhen((x): x is number => x % 2 === 0, {})),
      `
        -1-2-3-4-|
      `,
    )
  })

  test('calls sink.write only for chunks matching the predicate', async (t: TestContext) => {
    const write = t.mock.fn()

    await fromTimeline<number>(`
      -1-2-3-4-5-|
    `)
      .pipeThrough(tapWhen((x): x is number => x % 2 === 0, { write }))
      .pipeTo(new WritableStream())

    t.assert.equal(write.mock.callCount(), 2)
    t.assert.deepEqual(
      write.mock.calls.map(
        (call: { arguments: unknown[] }) => call.arguments[0],
      ),
      [2, 4],
    )
  })

  test('passes a writable controller as the second argument to sink.write', async (t: TestContext) => {
    const write = t.mock.fn()

    await fromTimeline<number>(`
      -1-|
    `)
      .pipeThrough(tapWhen((_x): _x is number => true, { write }))
      .pipeTo(new WritableStream())

    t.assert.equal(write.mock.callCount(), 1)
    t.assert.ok(
      write.mock.calls[0]!.arguments[1] instanceof
        WritableStreamDefaultController,
    )
  })

  test('narrows the type given to the sink via a type guard', async (t: TestContext) => {
    const seen: A[] = []
    const items: AB[] = [
      { type: 'a', value: 1 },
      { type: 'b', value: 'hi' },
      { type: 'a', value: 2 },
    ]

    await fromCollection<AB>(items)
      .pipeThrough(
        tapWhen(isA, {
          write(chunk) {
            seen.push(chunk)
          },
        }),
      )
      .pipeTo(new WritableStream())

    t.assert.deepEqual(seen, [
      { type: 'a', value: 1 },
      { type: 'a', value: 2 },
    ])
  })

  test('works when the sink has no write method', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -1-2-3-|
      `).pipeThrough(tapWhen((_x): _x is number => true, {})),
      `
        -1-2-3-|
      `,
    )
  })

  test('awaits an async sink.write before emitting the next chunk', async (t: TestContext) => {
    const order: string[] = []

    await fromTimeline<number>(`
      -1-2-|
    `)
      .pipeThrough(
        tapWhen((_x): _x is number => true, {
          async write(chunk) {
            order.push(`write-start-${chunk}`)
            await new Promise((resolve) => setTimeout(resolve, 5))
            order.push(`write-end-${chunk}`)
          },
        }),
      )
      .pipeTo(
        new WritableStream({
          write(chunk) {
            order.push(`read-${chunk}`)
          },
        }),
      )

    t.assert.deepEqual(order, [
      'write-start-1',
      'write-end-1',
      'read-1',
      'write-start-2',
      'write-end-2',
      'read-2',
    ])
  })

  test('forwards sink.start and sink.close lifecycle hooks', async (t: TestContext) => {
    const start = t.mock.fn()
    const close = t.mock.fn()

    await fromTimeline<number>(`
      -1-2-|
    `)
      .pipeThrough(
        tapWhen((_x): _x is number => true, { start, write() {}, close }),
      )
      .pipeTo(new WritableStream())

    t.assert.equal(start.mock.callCount(), 1)
    t.assert.equal(close.mock.callCount(), 1)
  })

  test('forwards sink.abort when the writable side is aborted', async (t: TestContext) => {
    let abortReason: unknown
    const pair = tapWhen<number, number>((x): x is number => true, {
      abort(reason) {
        abortReason = reason
      },
    })

    pair.readable.pipeTo(new WritableStream()).catch(() => {
      //
    })

    const writer = pair.writable.getWriter()
    const reason = new Error('boom')
    await writer.abort(reason)

    t.assert.equal(abortReason, reason)
  })
})
