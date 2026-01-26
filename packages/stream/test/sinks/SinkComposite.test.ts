import { fromTimeline } from '@johngw/stream-test-bun'
import { SinkComposite } from '@johngw/stream/sinks/SinkComposite'
import { describe, expect, mock, test } from 'bun:test'

describe('SinkComposite', () => {
  test('composing underlying sinks', async () => {
    const close = mock()
    const start = mock()
    const write = mock()

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

    expect(close.mock.calls).toEqual([[], []])

    expect(start.mock.calls).toEqual([
      [expect.any(WritableStreamDefaultController)],
      [expect.any(WritableStreamDefaultController)],
    ])

    expect(write.mock.calls).toEqual([
      [1, expect.any(WritableStreamDefaultController)],
      [1, expect.any(WritableStreamDefaultController)],
      [2, expect.any(WritableStreamDefaultController)],
      [2, expect.any(WritableStreamDefaultController)],
      [3, expect.any(WritableStreamDefaultController)],
      [3, expect.any(WritableStreamDefaultController)],
      [4, expect.any(WritableStreamDefaultController)],
      [4, expect.any(WritableStreamDefaultController)],
      [5, expect.any(WritableStreamDefaultController)],
      [5, expect.any(WritableStreamDefaultController)],
    ])
  })
})
