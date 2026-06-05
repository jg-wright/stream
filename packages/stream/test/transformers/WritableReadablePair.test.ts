import { assertTimeline, fromTimeline } from '@johngw/stream-assert'
import { WritableReadablePair } from '@johngw/stream/transformers/WritableReadablePair'
import { describe, test, type TestContext } from 'node:test'

describe('WritableReadablePair', () => {
  test('with no sink/source, behaves like a stalled stream (no chunks are emitted)', async (t: TestContext) => {
    const fn = t.mock.fn()
    const pair = new WritableReadablePair<number, number>()
    await fromTimeline<number>(`
      -1-2-3-|
    `)
      .pipeTo(pair.writable)
      .catch(() => {
        //
      })
    pair.readable.pipeTo(new WritableStream({ write: fn })).catch(() => {
      //
    })
    t.assert.equal(fn.mock.callCount(), 0)
  })

  test('write hook receives chunk, readable controller, and writable controller', async (t: TestContext) => {
    const write = t.mock.fn(
      (
        chunk: number,
        readableController: ReadableStreamDefaultController<number>,
        _writableController: WritableStreamDefaultController,
      ) => {
        readableController.enqueue(chunk * 2)
      },
    )

    await assertTimeline(
      fromTimeline<number>(`
        -1-2-3-|
      `).pipeThrough(new WritableReadablePair<number, number>({ write })),
      `
        -2-4-6-|
      `,
    )

    t.assert.equal(write.mock.callCount(), 3)
    write.mock.calls.forEach((call) => {
      t.assert.equal(call.arguments.length, 3)
      t.assert.ok(
        call.arguments[1] instanceof ReadableStreamDefaultController,
        'second arg should be a readable controller',
      )
      t.assert.ok(
        call.arguments[2] instanceof WritableStreamDefaultController,
        'third arg should be a writable controller',
      )
    })
  })

  test('the write hook can enqueue multiple chunks per input', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -1-2-|
      `).pipeThrough(
        new WritableReadablePair<number, number>({
          write(chunk, readableController) {
            readableController.enqueue(chunk)
            readableController.enqueue(chunk)
          },
        }),
      ),
      `
        -1-1-2-2-|
      `,
    )
  })

  test('sink.start is called with a writable controller and runs before writes', async (t: TestContext) => {
    const order: string[] = []
    const start = t.mock.fn((controller: WritableStreamDefaultController) => {
      t.assert.ok(controller instanceof WritableStreamDefaultController)
      order.push('start')
    })

    await fromTimeline<number>(`
      -1-|
    `).pipeTo(
      new WritableReadablePair<number, number>({
        start,
        write() {
          order.push('write')
        },
      }).writable,
    )

    t.assert.equal(start.mock.callCount(), 1)
    t.assert.deepEqual(order, ['start', 'write'])
  })

  test('sink.close is called and the readable side then closes', async (t: TestContext) => {
    const close = t.mock.fn()
    const pair = new WritableReadablePair<number, number>({ close })

    const readableDone = pair.readable.pipeTo(new WritableStream())
    await fromTimeline<number>(`
      ---|
    `).pipeTo(pair.writable)

    await readableDone
    t.assert.equal(close.mock.callCount(), 1)
  })

  test('sink.abort is called and the readable side is errored with the reason', async (t: TestContext) => {
    let abortReason: unknown
    const pair = new WritableReadablePair<number, number>({
      abort(reason) {
        abortReason = reason
      },
    })

    const readable = pair.readable.pipeTo(new WritableStream())
    const writer = pair.writable.getWriter()
    const reason = new Error('boom')
    await writer.abort(reason)

    await t.assert.rejects(readable, { message: 'boom' })
    t.assert.equal(abortReason, reason)
  })

  test('source.start is called with a readable controller', async (t: TestContext) => {
    const start = t.mock.fn(
      (controller: ReadableStreamDefaultController<number>) => {
        t.assert.ok(controller instanceof ReadableStreamDefaultController)
        controller.enqueue(99)
      },
    )

    const pair = new WritableReadablePair<number, number>({}, { start })

    const reader = pair.readable.getReader()
    const { value } = await reader.read()
    t.assert.equal(value, 99)
    t.assert.equal(start.mock.callCount(), 1)

    await reader.cancel()
  })

  test('source.pull is invoked by the readable side', async (t: TestContext) => {
    let count = 0
    const pull = t.mock.fn(
      (controller: ReadableStreamDefaultController<number>) => {
        controller.enqueue(++count)
        if (count === 3) controller.close()
      },
    )

    await assertTimeline(
      new WritableReadablePair<number, number>({}, { pull }).readable,
      `
        1-2-3-|
      `,
    )
    t.assert.ok(pull.mock.callCount() >= 3)
  })

  test('cancelling the readable side calls source.cancel and errors the writable side', async (t: TestContext) => {
    const cancel = t.mock.fn()
    const pair = new WritableReadablePair<number, number>({}, { cancel })

    const reason = new Error('reader-gone')
    await pair.readable.cancel(reason)

    t.assert.equal(cancel.mock.callCount(), 1)
    t.assert.equal(cancel.mock.calls[0]!.arguments[0], reason)

    const writer = pair.writable.getWriter()
    await t.assert.rejects(writer.write(1))
  })

  test('closing via the readable controller errors the writable side', async (t: TestContext) => {
    const pair = new WritableReadablePair<number, number>({
      write(_chunk, readableController) {
        readableController.close()
      },
    })

    const readableDone = pair.readable.pipeTo(new WritableStream())
    const writer = pair.writable.getWriter()
    await writer.write(1)

    await readableDone
    await t.assert.rejects(writer.closed, {
      message: 'Readable side was closed',
    })
  })

  test('erroring via the readable controller errors both sides', async (t: TestContext) => {
    const pair = new WritableReadablePair<number, number>({
      write(_chunk, readableController) {
        readableController.error(new Error('readable-error'))
      },
    })

    const readableDone = pair.readable.pipeTo(new WritableStream())
    const writer = pair.writable.getWriter()
    await writer.write(1)

    await t.assert.rejects(readableDone, { message: 'readable-error' })
    await t.assert.rejects(writer.closed, { message: 'readable-error' })
  })

  test('erroring via the writable controller errors both sides', async (t: TestContext) => {
    const pair = new WritableReadablePair<number, number>({
      write(_chunk, _readableController, writableController) {
        writableController.error(new Error('writable-error'))
      },
    })

    const readableDone = pair.readable.pipeTo(new WritableStream())
    const writer = pair.writable.getWriter()
    await writer.write(1).catch(() => {
      //
    })

    await t.assert.rejects(readableDone, { message: 'writable-error' })
    await t.assert.rejects(writer.closed, { message: 'writable-error' })
  })

  test('respects the writable queuing strategy (highWaterMark)', async (t: TestContext) => {
    const pair = new WritableReadablePair<number, number>(
      {
        async write(chunk, readableController) {
          await new Promise((resolve) => setTimeout(resolve, 10))
          readableController.enqueue(chunk)
        },
      },
      {},
      { writableStrategy: { highWaterMark: 2 } },
    )

    const writer = pair.writable.getWriter()
    pair.readable.pipeTo(new WritableStream()).catch(() => {
      //
    })

    writer.write(1)
    writer.write(2)
    t.assert.equal(writer.desiredSize, 0)
    await writer.close()
  })

  test('respects the readable queuing strategy (highWaterMark of 0 means no eager pull)', async (t: TestContext) => {
    const pull = t.mock.fn()
    new WritableReadablePair<number, number>(
      {},
      { pull },
      { readableStrategy: { highWaterMark: 0 } },
    )

    await new Promise((resolve) => setTimeout(resolve, 0))
    t.assert.equal(pull.mock.callCount(), 0)
  })

  test('source.start can run async work before reads are served', async () => {
    const pair = new WritableReadablePair<number, number>(
      {},
      {
        async start(controller) {
          await new Promise((resolve) => setTimeout(resolve, 10))
          ;(controller as ReadableStreamDefaultController<number>).enqueue(1)
          controller.close()
        },
      },
    )

    await assertTimeline(pair.readable, `1-|`)
  })

  test('async sink.write is awaited per chunk', async (t: TestContext) => {
    const order: string[] = []
    const pair = new WritableReadablePair<number, number>({
      async write(chunk, readableController) {
        order.push(`write-start-${chunk}`)
        await new Promise((resolve) => setTimeout(resolve, 5))
        order.push(`write-end-${chunk}`)
        readableController.enqueue(chunk)
      },
    })

    pair.readable.pipeTo(new WritableStream()).catch(() => {
      //
    })

    await fromTimeline<number>(`
      -1-2-|
    `).pipeTo(pair.writable)

    t.assert.deepEqual(order, [
      'write-start-1',
      'write-end-1',
      'write-start-2',
      'write-end-2',
    ])
  })

  test('used as a ReadableWritablePair for pipeThrough', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -1-2-3-|
      `).pipeThrough(
        new WritableReadablePair<number, string>({
          write(chunk, readableController) {
            readableController.enqueue(`v:${chunk}`)
          },
        }),
      ),
      `
        -v:1-v:2-v:3-|
      `,
    )
  })
})
