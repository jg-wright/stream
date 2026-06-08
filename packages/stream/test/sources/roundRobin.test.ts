import { roundRobin } from '@johngw/stream/sources/roundRobin'
import { toArray } from '@johngw/stream/sinks/toArray'
import { write } from '@johngw/stream/sinks/write'
import { delayedStream } from '../util.ts'
import { describe, test } from 'node:test'

describe('roundRobin', () => {
  test('it pulls, in order, from one stream at a time', async ({ assert }) => {
    assert.deepEqual(
      await toArray(
        roundRobin([
          delayedStream(0.3, [1, 2, 3]),
          delayedStream(0.1, ['one', 'two', 'three']),
        ]),
      ),
      [1, 'one', 2, 'two', 3, 'three'],
    )
  })

  test('streams that close before others will be removed from the round robin', async ({
    assert,
  }) => {
    assert.deepEqual(
      await toArray(
        roundRobin([
          delayedStream(0.3, [1]),
          delayedStream(0.2, ['one', 'two', 'three']),
        ]),
      ),
      [1, 'one', 'two', 'three'],
    )
  })

  test('cancelling the stream will cancel all upstreams', async ({
    assert,
    mock,
  }) => {
    const oneCancel = mock.fn()
    const one = new ReadableStream({
      pull(controller) {
        controller.enqueue(1)
      },
      cancel: oneCancel,
    })

    const twoCancel = mock.fn()
    const two = new ReadableStream({
      pull(controller) {
        controller.enqueue(2)
      },
      cancel: twoCancel,
    })

    const three = roundRobin([one, two])
    const reader = three.getReader()
    await reader.cancel('foobar')

    assert.equal(oneCancel.mock.calls[0]!.arguments[0], 'foobar')
    assert.equal(twoCancel.mock.calls[0]!.arguments[0], 'foobar')
  })

  test('immediately closes with no streams to merge', async ({
    assert,
    mock,
  }) => {
    const fn = mock.fn()
    await roundRobin([]).pipeTo(write())
    assert.equal(fn.mock.callCount(), 0)
  })
})
