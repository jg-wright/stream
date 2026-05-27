import { merge } from '@johngw/stream/sources/merge'
import { write } from '@johngw/stream/sinks/write'
import { describe, test } from 'node:test'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('merge', () => {
  test('successfully merge all streams', async () => {
    await assertTimeline(
      merge([
        fromTimeline(`
    -1-----2-----3----|
      `),
        fromTimeline(`
    -1-----2-----3----|
      `),
        fromTimeline(`
    -4-----5-----6----|
      `),
      ]),
      `
    -1-1-4-2-2-5-3-3-6-
      `,
    )
  })

  test('aborted merged streams', async ({ assert }) => {
    await assert.rejects(
      merge([
        fromTimeline(`
    -1-----2-----3----|
      `),
        fromTimeline(`
    -1-----2-----3----|
      `),
        fromTimeline(`
    -4-----5-----6----|
      `),
      ]).pipeTo(write(), { signal: AbortSignal.abort() }),
    )
  })

  test('cancelling the stream will cancel all upstreams', async ({
    assert,
  }) => {
    try {
      await assertTimeline(
        merge([
          fromTimeline(`
      --------X
        `),
          fromTimeline(`
      --------X
        `),
        ]),
        `
      -E(foo)--
        `,
      )
    } catch (error: any) {
      assert.equal(error.message, 'foo')
    }
  })

  test('merge streams of different lengths', async () => {
    await assertTimeline(
      merge([
        fromTimeline(`
    -1-|
      `),
        fromTimeline(`
    -a-----b-|
      `),
        fromTimeline(`
    -c-----d-----e---|
      `),
      ]),
      `
    -1-a-c-b-d---e----
      `,
    )
  })

  test('asynchronous streams', async () => {
    await assertTimeline(
      merge([
        fromTimeline(`
    -1-|
      `),
        fromTimeline(`
    -----------a----------b-|
      `),
        fromTimeline(`
    ----------------c--------------------d--------------------e-|
      `),
      ]),
      `
    -1---------a----c-----b--------------d--------------------e-|
      `,
    )
  })

  test('merging no streams closes the stream immediately', async ({
    assert,
    mock,
  }) => {
    const fn = mock.fn()
    await merge([]).pipeTo(write(fn))
    assert.equal(fn.mock.callCount(), 0)
  })
})
