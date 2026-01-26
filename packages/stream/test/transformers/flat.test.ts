import { expect, test, describe } from 'bun:test'

import { timeout } from '@johngw/stream-common'
import { fromTimeline } from '@johngw/stream-test-bun'
import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { flat } from '@johngw/stream/transformers/flat'

describe('flat', () => {
  test('flattens iterables', async () => {
    await expect(
      fromTimeline(`
    -[1,2]-[3,[[4]]]-|
    `).pipeThrough(flat<number[]>()),
    ).toMatchTimeline(`
    -1-2---3-4-------|
  `)
  })

  test('flattens async iterables', async () => {
    await expect(
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
    ).toMatchTimeline(`
    -1-2-3-4-
  `)
  })

  test('flattens array likes', async () => {
    await expect(
      fromCollection({
        0: 'zero',
        1: 'one',
        2: 'three',
        length: 3,
      }).pipeThrough(flat()),
    ).toMatchTimeline(`
    -zero-one-three-
  `)
  })

  test('queues things that arent iterable', async () => {
    await expect(
      fromTimeline(`
    --{foo: bar}--|
    `).pipeThrough(flat<Record<string, string>>()),
    ).toMatchTimeline(`
    --{foo: bar}--
  `)
  })

  test('flattens a mixture of all iterables things', async () => {
    await expect(
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
    ).toMatchTimeline(`
    -1-2-3-zero-
  `)
  })
})
