import { some } from '@johngw/stream/transformers/some'
import { test, describe } from 'node:test'
import { write } from '@johngw/stream/sinks/write'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('some', () => {
  test('when not', async () => {
    await assertTimeline(
      fromTimeline(`
        -6-11-12-18-27-|
      `).pipeThrough(some((chunk: number) => chunk % 5 === 0)),
      `
        ---------------false
      `,
    )
  })

  test('when true', async () => {
    await assertTimeline(
      fromTimeline(`
        -5----X
      `).pipeThrough(some((chunk: number) => chunk % 5 === 0)),
      `
        -true--
      `,
    )
  })

  test('flushing', async () => {
    await assertTimeline(
      fromTimeline(`
        -6-11------20-|
      `).pipeThrough(
        some((chunk: number) => chunk % 5 === 0, {
          flushes: fromTimeline(`
        ------null-----
          `),
        }),
      ),
      `
        ------false----true
      `,
    )
  })

  test('allow flush errors to be sent down stream', async ({ assert }) => {
    await assert.rejects(
      fromTimeline(`
        ----X
      `)
        .pipeThrough(
          some(() => false, {
            flushes: fromTimeline(`
        -E-
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
        -1-1-----1-1-|
      `).pipeThrough(
        some(() => false, {
          ignoreFlushErrors: true,
          flushes: fromTimeline(`
      ------E-------
          `),
        }),
      ),
      `
        --------------false
      `,
    )
  })
})
