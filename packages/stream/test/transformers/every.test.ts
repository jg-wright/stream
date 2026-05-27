import { test, describe } from 'node:test'
import { every } from '@johngw/stream/transformers/every'
import { write } from '@johngw/stream/sinks/write'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('every', () => {
  test('when not', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -5-10-15-18-----X
      `).pipeThrough(every((chunk) => chunk % 5 === 0)),
      `
        ---------F-------
      `,
    )
  })

  test('when true', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -5-10-15-20-|
      `).pipeThrough(every((chunk) => chunk % 5 === 0)),
      `
        ------------T
      `,
    )
  })

  test('flushing', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -5-10-15-20-------25-----|
      `).pipeThrough(
        every((chunk) => chunk % 5 === 0, {
          flushes: fromTimeline(`
        ------------N-------------
          `),
        }),
      ),
      `
        ------------T------------T
      `,
    )
  })

  test('allow flush errors to be sent down stream', async ({ assert }) => {
    await assert.rejects(
      fromTimeline(`
        -----
      `)
        .pipeThrough(
          every(() => true, {
            flushes: fromTimeline(`
        --E--
            `),
          }),
        )
        .pipeTo(write()),
      { message: 'Timeline Error' },
    )
  })

  test('disallow flush errors to be sent down stream', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -1-1---1--------|
      `).pipeThrough(
        every(() => true, {
          ignoreFlushErrors: true,
          flushes: fromTimeline(`
        -----E-----------
          `),
        }),
      ),
      `
        ----------------T
      `,
    )
  })
})
