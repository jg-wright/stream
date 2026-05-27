import { test, describe } from 'node:test'
import {
  debounce,
  DebounceBackOffBehavior,
  DebounceLeadingBehavior,
  DebounceTrailingBehavior,
} from '@johngw/stream/transformers/debounce'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('debounce', () => {
  test('trailing only (by default)', async () => {
    await assertTimeline(
      fromTimeline(`
        --1--2------T10--|
      `).pipeThrough(debounce(10)),
      `
        -----T10-2--------
      `,
    )
  })

  test('leading only', async () => {
    await assertTimeline(
      fromTimeline(`
        --1--2--T10-|
      `).pipeThrough(debounce(10, new DebounceLeadingBehavior())),
      `
        --1--
      `,
    )
  })

  test('leading and trailing', async () => {
    await assertTimeline(
      fromTimeline(`
        -1-2-3--------------|
      `).pipeThrough(
        debounce(10, [
          new DebounceLeadingBehavior(),
          new DebounceTrailingBehavior(),
        ]),
      ),
      `
        -1-T10-3-
      `,
    )
  })

  test('back off', async () => {
    await assertTimeline(
      fromTimeline(`
        -1-2-3-4-T45-5----|
      `).pipeThrough(
        debounce(10, [
          new DebounceLeadingBehavior(),
          new DebounceBackOffBehavior({ inc: (x) => x * 2, max: 45 }),
        ]),
      ),
      `
        -1-----T45---5----
      `,
    )
  })
})
