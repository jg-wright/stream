import { ForkableRecallStream } from '../../src/sinks/ForkableRecallStream'
import { expectTimeline, fromTimeline } from '@johngw/stream-test-bun'
import { expect, test } from 'bun:test'

test('subscribing will always provide that last chunk', async () => {
  const forkable = new ForkableRecallStream()

  await fromTimeline(`
    --1--2--3--4--5--|
  `).pipeTo(forkable)

  await forkable.fork().pipeTo(
    expectTimeline(`
    --------------5--
    `)
  )

  await forkable.fork().pipeTo(
    expectTimeline(`
    --------------5--
    `)
  )
})
