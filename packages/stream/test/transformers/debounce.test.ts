import { test, describe, beforeEach, afterEach } from 'node:test'
import {
  debounce,
  DebounceBackOffBehavior,
  DebounceLeadingBehavior,
  DebounceTrailingBehavior,
} from '@johngw/stream/transformers/debounce'
import { assertTimeline, FakeClock, fromTimeline } from '@johngw/stream-assert'

describe('debounce', () => {
  let clock: FakeClock

  beforeEach(() => {
    clock = new FakeClock()
  })

  afterEach(() => {
    clock.uninstall()
  })

  test('trailing only (by default)', async () => {
    await assertTimeline(
      fromTimeline(
        `
        --1--2------T10--|
        `,
        { clock },
      ).pipeThrough(debounce(10)),
      `
        -----T10-2--------
      `,
      { clock },
    )
  })

  test('leading only', async () => {
    await assertTimeline(
      fromTimeline(
        `
        --1--2--T10-|
        `,
        { clock },
      ).pipeThrough(debounce(10, new DebounceLeadingBehavior())),
      `
        --1--
      `,
      { clock },
    )
  })

  test('leading and trailing', async () => {
    await assertTimeline(
      fromTimeline(
        `
        -1-2-3--------------|
        `,
        { clock },
      ).pipeThrough(
        debounce(10, [
          new DebounceLeadingBehavior(),
          new DebounceTrailingBehavior(),
        ]),
      ),
      `
        -1-T10-3-
      `,
      { clock },
    )
  })

  test('back off', async () => {
    await assertTimeline(
      fromTimeline(
        `
        -1-2-3-4-T45-5----|
        `,
        { clock },
      ).pipeThrough(
        debounce(10, [
          new DebounceLeadingBehavior(),
          new DebounceBackOffBehavior({ inc: (x) => x * 2, max: 45 }),
        ]),
      ),
      `
        -1-----T45---5----
      `,
      { clock },
    )
  })
})
