import { MemoryStorage } from '@johngw/stream/storages/MemoryStorage'
import { beforeEach, describe, expect, test } from 'bun:test'

let storage: MemoryStorage

beforeEach(() => {
  storage = new MemoryStorage()
})

describe('MemoryStorage', () => {
  test('getting unset values', () => {
    expect(storage.getItem('foo')).toBeNull()
  })

  test('set values', () => {
    storage.setItem('foo', 'bar')
    expect(storage.getItem('foo')).toBe('bar')
  })

  test('removing values', () => {
    storage.setItem('foo', 'bar')
    storage.removeItem('foo')
    expect(storage.getItem('foo')).toBeNull()
  })

  test('clearing', () => {
    storage.setItem('foo', 'bar')
    storage.setItem('bar', 'foo')
    storage.clear()
    expect(storage.getItem('foo')).toBeNull()
    expect(storage.getItem('bar')).toBeNull()
  })

  test('length', () => {
    storage.setItem('foo', 'bar')
    expect(storage.length).toBe(1)
    storage.setItem('bar', 'foo')
    expect(storage.length).toBe(2)
  })

  test('key', () => {
    storage.setItem('bar', 'foo')
    storage.setItem('foo', 'bar')
    expect(storage.key(0)).toBe('bar')
    expect(storage.key(1)).toBe('foo')
  })
})
