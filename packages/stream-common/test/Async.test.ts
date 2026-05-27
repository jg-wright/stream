import { describe, test, type TestContext } from 'node:test'
import { timeout } from '@johngw/stream-common/Async'

describe('timeout', () => {
  test('setTimeout', async (t: TestContext) => {
    const now = Date.now()
    await timeout(10)
    t.assert.ok(Date.now() - now >= 9, 'should be at least 10')
  })

  test('resolves a value', async (t: TestContext) => {
    t.assert.equal(await timeout(0, 'foobar'), 'foobar')
  })

  test('aborting', async (t: TestContext) => {
    await t.assert.rejects(timeout(10_000, undefined, AbortSignal.abort()))
    await t.assert.rejects(timeout(10_000, undefined, AbortSignal.timeout(10)))
  })
})
