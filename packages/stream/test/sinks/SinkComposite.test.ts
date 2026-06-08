import { fromTimeline } from '@johngw/stream-test'
import { SinkComposite } from '@johngw/stream/sinks/SinkComposite'
import { describe, test, type TestContext } from 'node:test'

describe('SinkComposite', () => {
  test('composing underlying sinks', async (t: TestContext) => {
    const close = t.mock.fn()
    const start = t.mock.fn()
    const write = t.mock.fn()

    await fromTimeline(`
      --1--2--3--4--5--|
    `).pipeTo(
      new WritableStream(
        new SinkComposite([
          {
            close,
            start,
            write,
          },
          {
            close,
            start,
            write,
          },
        ]),
      ),
    )

    t.assert.snapshot(close.mock.calls.map((c) => c.arguments))

    t.assert.equal(start.mock.callCount(), 2)
    t.assert.equal(start.mock.calls[0]!.arguments.length, 1)
    t.assert.equal(start.mock.calls[1]!.arguments.length, 1)
    t.assert.ok(
      start.mock.calls[0]!.arguments[0] instanceof
        WritableStreamDefaultController,
    )
    t.assert.ok(
      start.mock.calls[1]!.arguments[0] instanceof
        WritableStreamDefaultController,
    )

    t.assert.equal(write.mock.callCount(), 10)
    write.mock.calls.forEach((call) => {
      t.assert.equal(call.arguments.length, 2)
      t.assert.ok(call.arguments[1] instanceof WritableStreamDefaultController)
    })

    t.assert.snapshot(write.mock.calls.map((c) => c.arguments[0]))
  })
})
