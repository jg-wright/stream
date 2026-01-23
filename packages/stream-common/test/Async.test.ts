import { describe, expect, test } from 'bun:test'
import { timeout } from '../src/Async'

describe('timeout', () => {
  test('setTimeout', async () => {
    const now = Date.now()
    await timeout(10)
    expect(Date.now() - now).toBeGreaterThanOrEqual(9)
  })

  test('resolves a value', async () => {
    expect(await timeout(0, 'foobar')).toBe('foobar')
  })

  test('aborting', async () => {
    await expect(
      timeout(10_000, undefined, AbortSignal.abort())
    ).rejects.toThrow()
    await expect(
      timeout(10_000, undefined, AbortSignal.timeout(10))
    ).rejects.toThrow()
  })
})
