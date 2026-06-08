import { MemoryStorage } from '@johngw/stream/storages/MemoryStorage'
import { beforeEach, describe, test, type TestContext } from 'node:test'

let storage: MemoryStorage

beforeEach(() => {
  storage = new MemoryStorage()
})

describe('MemoryStorage', () => {
  test('getting unset values', (t: TestContext) => {
    t.assert.strictEqual(storage.getItem('foo'), null)
  })

  test('set values', (t: TestContext) => {
    storage.setItem('foo', 'bar')
    t.assert.equal(storage.getItem('foo'), 'bar')
  })

  test('removing values', (t: TestContext) => {
    storage.setItem('foo', 'bar')
    storage.removeItem('foo')
    t.assert.strictEqual(storage.getItem('foo'), null)
  })

  test('clearing', (t: TestContext) => {
    storage.setItem('foo', 'bar')
    storage.setItem('bar', 'foo')
    storage.clear()
    t.assert.strictEqual(storage.getItem('foo'), null)
    t.assert.strictEqual(storage.getItem('bar'), null)
  })

  test('length', (t: TestContext) => {
    storage.setItem('foo', 'bar')
    t.assert.strictEqual(storage.length, 1)
    storage.setItem('bar', 'foo')
    t.assert.strictEqual(storage.length, 2)
  })

  test('key', (t: TestContext) => {
    storage.setItem('bar', 'foo')
    storage.setItem('foo', 'bar')
    t.assert.equal(storage.key(0), 'bar')
    t.assert.equal(storage.key(1), 'foo')
  })
})
