import { interval } from '@johngw/stream/sources/interval'
import { write } from '@johngw/stream/sinks/write'
import { describe, expect, mock, test } from 'bun:test'
import { throwUnlessTimeout } from '@johngw/stream-common'

describe('interval', () => {
  test('continuasly emits date events until terminated', (done) => {
    const fn = mock()

    interval(50)
      .pipeTo(write(fn), { signal: AbortSignal.timeout(400) })
      .catch((error) => {
        throwUnlessTimeout(error)
        expect(fn.mock.calls.length).toBeGreaterThanOrEqual(5)
        done()
      })
  })
})
