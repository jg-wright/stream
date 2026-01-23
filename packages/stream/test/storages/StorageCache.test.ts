import { MemoryStorage } from '@johngw/stream/storages/MemoryStorage'
import { StorageCache } from '@johngw/stream/storages/StorageCache'
import { timeout } from '@johngw/stream-common'
import { beforeEach, expect, test } from 'bun:test'

let cache: StorageCache

beforeEach(() => {
  cache = new StorageCache(new MemoryStorage(), 'test', 10)
})

test('ms', () => {
  expect(cache.ms).toBe(10)
})

test('getting unset values', () => {
  expect(cache.get(['foo'])).toBeUndefined()
})

test('getting set values', () => {
  cache.set(['foo'], 'bar')
  expect(cache.get(['foo'])).toBe('bar')
})

test('getting stale values', async () => {
  cache.set(['foo'], 'bar')
  await timeout(11)
  expect(cache.get(['foo'])).toBeUndefined()
})

test('timeLeft', async () => {
  cache.set(['foo'], 'bar')
  const timeLeft = cache.timeLeft(['foo'])
  expect(timeLeft).toBeGreaterThan(0)
  expect(timeLeft).toBeLessThanOrEqual(10)
})

test('unsetting values', () => {
  cache.set(['foo'], 'bar')
  cache.unset(['foo'])
  expect(cache.get(['foo'])).toBeUndefined()
})

test('storage shapes', () => {
  cache.set(['foo', 'bar'], 'something')
  cache.set(['a', 'b'], 'c')
  cache.set(['foo', 'rab'], 'thrab')
  expect(cache.getAll()).toEqual({
    'a.b': {
      t: expect.any(Number),
      v: 'c',
    },
    'foo.bar': {
      t: expect.any(Number),
      v: 'something',
    },
    'foo.rab': {
      t: expect.any(Number),
      v: 'thrab',
    },
  })
})

test('clearing a subset', () => {
  cache.set(['foo', 'bar'], 'something')
  cache.set(['foo', 'rab'], 'thrab')
  expect(cache.unset(['foo']))
  expect(cache.getAll()).toEqual({})
})
