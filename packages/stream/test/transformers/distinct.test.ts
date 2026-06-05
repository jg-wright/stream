import { test, describe } from 'node:test'
import { distinct } from '@johngw/stream/transformers/distinct'
import { write } from '@johngw/stream/sinks/write'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('distinct', () => {
  test('only emits distinct values', async () => {
    await assertTimeline(
      fromTimeline(`
        -1-1-2-2-2-1-2-3-4-3-2-1-|
      `).pipeThrough(distinct()),
      `
        -1---2---------3-4--------
      `,
    )
  })

  test('selecting a distinct key', async () => {
    await assertTimeline(
      fromTimeline<{ a: number; n: string }>(`
        -{a: 4,n: f}-{a: 7,n: b}-{a: 5,n: f}-|
      `).pipeThrough(distinct({ selector: (x) => x.n })),
      `
        -{a: 4,n: f}-{a: 7,n: b}-----------|
      `,
    )
  })

  test('flushing with a stream', async () => {
    await assertTimeline(
      fromTimeline(`
        -1-1------1-1-|
      `).pipeThrough(
        distinct({
          flushes: fromTimeline(`
        -----N---------
          `),
        }),
      ),
      `
        -1---1---------
      `,
    )
  })

  test('allow flush errors to be sent down stream', async ({ assert }) => {
    await assert.rejects(
      fromTimeline(`
        -------------X
      `)
        .pipeThrough(
          distinct({
            flushes: fromTimeline(`
        -E------------
              `),
          }),
        )
        .pipeTo(write()),
      { message: 'Timeline Error' },
    )
  })

  test('disallow flush errors to be sent down stream', async () => {
    await assertTimeline(
      fromTimeline(`
        -1-1------1-1-|
      `).pipeThrough(
        distinct({
          ignoreFlushErrors: true,
          flushes: fromTimeline(`
        -----E---------
            `),
        }),
      ),
      `
        -1-------------
      `,
    )
  })
})
