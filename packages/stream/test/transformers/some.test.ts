import { fromTimeline } from '@johngw/stream-test-bun'
import { some } from '@johngw/stream/transformers/some'
import { expect, test } from 'bun:test'
import { write } from '@johngw/stream/sinks/write'

test('when not', async () => {
  await expect(
    fromTimeline(`
    -6-11-12-18-27-|
  `).pipeThrough(some((chunk: number) => chunk % 5 === 0))
  ).toMatchTimeline(`
    ---------------false
  `)
})

test('when true', async () => {
  await expect(
    fromTimeline(`
    -5----X
    `).pipeThrough(some((chunk: number) => chunk % 5 === 0))
  ).toMatchTimeline(`
    -true--
  `)
})

test('flushing', async () => {
  await expect(
    fromTimeline(`
    -6-11------20-|
    `).pipeThrough(
      some((chunk: number) => chunk % 5 === 0, {
        flushes: fromTimeline(`
    ------null-----
        `),
      })
    )
  ).toMatchTimeline(`
    ------false----true
  `)
})

test('allow flush errors to be sent down stream', async () => {
  await expect(
    fromTimeline(`
    ----X
    `)
      .pipeThrough(
        some(() => false, {
          flushes: fromTimeline(`
    -E-
          `),
        })
      )
      .pipeTo(write())
  ).rejects.toThrow('Timeline Error')
})

test('disallow flush errors to be sent down stream', async () => {
  await expect(
    fromTimeline(`
    -1-1-----1-1-|
    `).pipeThrough(
      some(() => false, {
        ignoreFlushErrors: true,
        flushes: fromTimeline(`
    ------E-------
        `),
      })
    )
  ).toMatchTimeline(`
    --------------false
  `)
})
