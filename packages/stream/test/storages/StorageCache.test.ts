import { MemoryStorage } from '@johngw/stream/storages/MemoryStorage'
import { StorageCache } from '@johngw/stream/storages/StorageCache'
import { timeout } from '@johngw/stream-common'
import { beforeEach, describe, test, type TestContext } from 'node:test'

let cache: StorageCache

beforeEach(() => {
  cache = new StorageCache(new MemoryStorage(), 'test', 10)
})

describe('StorageCache', () => {
  test('ms', (t: TestContext) => {
    t.assert.strictEqual(cache.ms, 10)
  })

  test('getting unset values', (t: TestContext) => {
    t.assert.strictEqual(cache.get(['foo']), undefined)
  })

  test('getting set values', (t: TestContext) => {
    cache.set(['foo'], 'bar')
    t.assert.equal(cache.get(['foo']), 'bar')
  })

  test('getting stale values', async (t: TestContext) => {
    cache.set(['foo'], 'bar')
    await timeout(11)
    t.assert.strictEqual(cache.get(['foo']), undefined)
  })

  test('timeLeft', async (t: TestContext) => {
    cache.set(['foo'], 'bar')
    const timeLeft = cache.timeLeft(['foo'])
    t.assert.ok(timeLeft > 0)
    t.assert.ok(timeLeft <= 10)
  })

  test('unsetting values', (t: TestContext) => {
    cache.set(['foo'], 'bar')
    cache.unset(['foo'])
    t.assert.strictEqual(cache.get(['foo']), undefined)
  })

  test('storage shapes', (t: TestContext) => {
    cache.set(['foo', 'bar'], 'something')
    cache.set(['a', 'b'], 'c')
    cache.set(['foo', 'rab'], 'thrab')
    for (const entry of Object.values<{ t: number }>(cache.getAll())) {
      t.assert.strictEqual(typeof entry.t, 'number')
      entry.t = 0
    }
    t.assert.deepStrictEqual(
      Object.entries<any>(cache.getAll())
        .toSorted(([k1], [k2]) => k1.localeCompare(k2))
        .map(([k, { v }]) => [k, v]),
      [
        ['a.b', 'c'],
        ['foo.bar', 'something'],
        ['foo.rab', 'thrab'],
      ],
    )
  })

  test('clearing a subset', (t: TestContext) => {
    cache.set(['foo', 'bar'], 'something')
    cache.set(['foo', 'rab'], 'thrab')
    cache.unset(['foo'])
    t.assert.deepEqual(cache.getAll(), {})
  })
})
