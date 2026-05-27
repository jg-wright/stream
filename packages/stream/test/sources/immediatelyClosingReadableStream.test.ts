import { immediatelyClosingReadableStream } from '@johngw/stream/sources/immediatelyClosingReadableStream'
import { describe, test } from 'node:test'

describe('immediatelyClosingReadableStream', () => {
  test('it closes the stream immediately', async ({ assert, mock }) => {
    const fn = mock.fn()
    await immediatelyClosingReadableStream().pipeTo(
      new WritableStream({ write: fn }),
    )
    assert.equal(fn.mock.callCount(), 0)
  })
})
