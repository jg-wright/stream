import { merge, write } from '@johngw/stream-common/Stream'
import { describe, test } from 'node:test'
import { fromTimeline } from '@johngw/stream-test'

describe('fromTimeline', () => {
  test('numbers', async ({ assert, mock }) => {
    const fn = mock.fn()

    await fromTimeline(`
      --1--2--3--4--5--6--|
    `).pipeTo(write(fn))

    assert.snapshot(fn.mock.calls)
  })

  test('strings', async ({ assert, mock }) => {
    const fn = mock.fn()

    await fromTimeline(`
      --one--two--three-four--|
    `).pipeTo(write(fn))

    assert.snapshot(fn.mock.calls)
  })

  test('objects', async ({ assert, mock }) => {
    const fn = mock.fn()

    await fromTimeline(`
      --{foo: bar,a: b}--{ one: 1, two: 2 }--|
    `).pipeTo(write(fn))

    assert.snapshot(fn.mock.calls)
  })

  test('arrays', async ({ assert, mock }) => {
    const fn = mock.fn()

    await fromTimeline(`
      --[1,one, 3,  4]--|
    `).pipeTo(write(fn))

    assert.snapshot(fn.mock.calls)
  })

  test('booleans', async ({ assert, mock }) => {
    const fn = mock.fn()

    await fromTimeline(`--true--false--T--F--|`).pipeTo(write(fn))

    assert.snapshot(fn.mock.calls)
  })

  test('nulls', async ({ assert, mock }) => {
    const fn = mock.fn()

    await fromTimeline(`--null--N--|`).pipeTo(write(fn))

    assert.snapshot(fn.mock.calls)
  })

  test('errors', async ({ assert, mock }) => {
    const fn = mock.fn()

    await assert.rejects(fromTimeline(`--1--2--E--3--`).pipeTo(write(fn)))

    assert.snapshot(fn.mock.calls)
  })

  test('instances', async ({ assert, mock }) => {
    const fn = mock.fn()

    await fromTimeline(`--<Date>--<Mung>--<Foo>--`).pipeTo(write(fn))

    assert.snapshot(fn.mock.calls)
  })

  test('timeline', async ({ assert, mock }) => {
    const fn = mock.fn()

    await merge([
      fromTimeline('--1--2--3--4--|'),
      fromTimeline('-a----b-c-d---|'),
    ]).pipeTo(write(fn))

    assert.snapshot(fn.mock.calls)
  })
})
