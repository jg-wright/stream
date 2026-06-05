import { interval } from '@johngw/stream/sources/interval'
import { write } from '@johngw/stream/sinks/write'
import { describe, test, type TestContext } from 'node:test'
import { throwUnlessTimeout } from '@johngw/stream-common'

describe('interval', () => {
  test('continuasly emits date events until terminated', async (t: TestContext) => {
    const fn = t.mock.fn()
    const { promise, resolve } = Promise.withResolvers<void>()

    interval(50)
      .pipeTo(write(fn), { signal: AbortSignal.timeout(400) })
      .catch((error) => {
        throwUnlessTimeout(error)
        t.assert.ok(
          fn.mock.callCount() > 5 && fn.mock.callCount() <= 8,
          'Expecting call count to be > 5 <= 8',
        )
        resolve()
      })

    await promise
  })
})
