import { immediatelyClosingReadableStream } from '@johngw/stream/sources/immediatelyClosingReadableStream'
import { expect, mock, test } from 'bun:test'

test('it closes the stream immediately', async () => {
  const fn = mock()
  await immediatelyClosingReadableStream().pipeTo(
    new WritableStream({ write: fn })
  )
  expect(fn).not.toHaveBeenCalled()
})
