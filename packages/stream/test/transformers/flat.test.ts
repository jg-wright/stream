import { test, describe } from 'node:test'
import { timeout } from '@johngw/stream-common'
import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { flat } from '@johngw/stream/transformers/flat'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('flat', () => {
  test('flattens iterables', async () => {
    await assertTimeline(
      fromTimeline(`
        -[1,2]-[3,[[4]]]-|
      `).pipeThrough(flat<number[]>()),
      `
        -1-2---3-4-------|
      `,
    )
  })

  test('flattens async iterables', async () => {
    await assertTimeline(
      fromCollection([
        (async function* () {
          yield 1
          await timeout(1)
          yield 2
        })(),
        (async function* () {
          yield 3
          await timeout(1)
          yield (async function* () {
            await timeout(1)
            yield 4
          })()
        })(),
      ]).pipeThrough(flat()),
      `
        -1-2-3-4-
      `,
    )
  })

  test('flattens array likes', async () => {
    await assertTimeline(
      fromCollection({
        0: 'zero',
        1: 'one',
        2: 'three',
        length: 3,
      }).pipeThrough(flat()),
      `
        -zero-one-three-
      `,
    )
  })

  test('queues things that arent iterable', async () => {
    await assertTimeline(
      fromTimeline(`
        --{foo: bar}--|
      `).pipeThrough(flat<Record<string, string>>()),
      `
        --{foo: bar}--
      `,
    )
  })

  test('flattens a mixture of all iterables things', async () => {
    await assertTimeline(
      fromCollection([
        [
          (async function* () {
            yield 1
            await timeout(1)
            yield [2, 3]
          })(),
          (async function* () {
            yield [{ 0: 'zero', length: 1 }]
          })(),
        ],
      ]).pipeThrough(flat()),
      `
        -1-2-3-zero-
      `,
    )
  })
})
