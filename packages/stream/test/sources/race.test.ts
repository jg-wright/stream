import { race } from '@johngw/stream/sources/race'
import { write } from '@johngw/stream/sinks/write'
import { fromTimeline } from '@johngw/stream-test-bun'
import { describe, expect, mock, test } from 'bun:test'

describe('race', () => {
  test('mirrors the first source stream to queue an item', async () => {
    await expect(
      race([
        fromTimeline(`
    -T1000-1-|
      `),
        fromTimeline(`
    -T10---2-|
      `),
      ]),
    ).toMatchTimeline(`
    -------2-
  `)
  })

  test('immediately closes if there are 0 streams', async () => {
    const fn = mock()
    await race([]).pipeTo(write(fn))
    expect(fn).not.toHaveBeenCalled()
  })

  test('receives an error from the first stream that errors', async () => {
    await expect(
      race([
        fromTimeline(`
    ------------------------------E(foo)-|
      `),
        fromTimeline(`
    -----------2-----------------------------3-|
      `),
      ]).pipeTo(write()),
    ).rejects.toThrow('foo')
  })

  test('cancels upstream when aborted', async () => {
    await expect(
      race([
        fromTimeline(`
    ----X
      `),
      ]).pipeTo(write(), { signal: AbortSignal.abort() }),
    ).rejects.toThrow()
  })
})
