import { race } from '@johngw/stream/sources/race'
import { write } from '@johngw/stream/sinks/write'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { assertTimeline, FakeClock, fromTimeline } from '@johngw/stream-assert'

describe('race', () => {
  let clock: FakeClock

  beforeEach(() => {
    clock = new FakeClock()
  })

  afterEach(() => {
    clock.uninstall()
  })

  test('mirrors the first source stream to queue an item', async () => {
    await assertTimeline(
      race([
        fromTimeline(
          `
    -T1000-1-|
          `,
          { clock },
        ),
        fromTimeline(
          `
    -T10---2-|
          `,
          { clock },
        ),
      ]),
      `
    -------2-
      `,
      { clock },
    )
  })

  test('immediately closes if there are 0 streams', async ({
    assert,
    mock,
  }) => {
    const fn = mock.fn()
    await race([]).pipeTo(write(fn))
    assert.equal(fn.mock.callCount(), 0)
  })

  test('receives an error from the first stream that errors', async ({
    assert,
  }) => {
    await assert.rejects(
      race([
        fromTimeline(
          `
    ------------------------------E(foo)-|
          `,
          { clock },
        ),
        fromTimeline(
          `
    -----------2-----------------------------3-|
          `,
          { clock },
        ),
      ]).pipeTo(write()),
      { message: 'foo' },
    )
  })

  test('cancels upstream when aborted', async ({ assert }) => {
    await assert.rejects(
      race([
        fromTimeline(
          `
          ----X
          `,
          { clock },
        ),
      ]).pipeTo(write(), { signal: AbortSignal.abort() }),
    )
  })
})
