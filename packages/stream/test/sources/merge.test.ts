import { merge } from '@johngw/stream/sources/merge'
import { write } from '@johngw/stream/sinks/write'
import { fromTimeline } from '@johngw/stream-test-bun'
import { expect, mock, test } from 'bun:test'

test('successfully merge all streams', async () => {
  await expect(
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
    ])
  ).toMatchTimeline(`
    -1-1-4-2-2-5-3-3-6-
  `)
})

test('aborted merged streams', async () => {
  await expect(
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
    ]).pipeTo(write(), { signal: AbortSignal.abort() })
  ).rejects.toThrow()
})

test('cancelling the stream will cancel all upstreams', async () => {
  try {
    await expect(
      merge([
        fromTimeline(`
    --------X
        `),
        fromTimeline(`
    --------X
        `),
      ])
    ).toMatchTimeline(`
    -E(foo)--
    `)
  } catch (error) {
    expect(error).toHaveProperty('message', '\n\nfoo')
  }
})

test('merge streams of different lengths', async () => {
  await expect(
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
    ])
  ).toMatchTimeline(`
    -1-a-c-b-d---e----
  `)
})

test('asynchronous streams', async () => {
  await expect(
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
    ])
  ).toMatchTimeline(`
    -1---------a----c-----b--------------d--------------------e-|
  `)
})

test('merging no streams closes the stream immediately', async () => {
  const fn = mock()
  await merge([]).pipeTo(write(fn))
  expect(fn).not.toHaveBeenCalled()
})
