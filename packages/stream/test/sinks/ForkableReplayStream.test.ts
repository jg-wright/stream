import { ForkableReplayStream } from '@johngw/stream/sinks/ForkableReplayStream'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'
import { describe, test } from 'node:test'

describe('ForkableReplayStream', () => {
  test('subscribing will replay all previously emitted values', async () => {
    const forkable = new ForkableReplayStream()

    await fromTimeline(`
      --1--2--3--4--5--|
    `).pipeTo(forkable)

    await assertTimeline(
      forkable.fork(),
      `
      --1--2--3--4--5--
      `,
    )

    await assertTimeline(
      forkable.fork(),
      `
      --1--2--3--4--5--
      `,
    )
  })

  test('max size', async () => {
    const forkable = new ForkableReplayStream(2)

    await fromTimeline(`
      --1--2--3--4--5--|
    `).pipeTo(forkable)

    await assertTimeline(
      forkable.fork(),
      `
      -----------4--5--
      `,
    )
  })

  test('clearing', async () => {
    const forkable = new ForkableReplayStream()

    await fromTimeline(`
      --1--2--3--4--5--|
    `).pipeTo(forkable)

    forkable.clear()

    await assertTimeline(
      forkable.fork(),
      `
      X
      `,
    )
  })
})
