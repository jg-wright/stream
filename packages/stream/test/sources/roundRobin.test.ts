import { roundRobin } from '@johngw/stream/sources/roundRobin'
import { toArray } from '@johngw/stream/sinks/toArray'
import { write } from '@johngw/stream/sinks/write'
import { delayedStream } from '../util'
import { describe, expect, mock, test } from 'bun:test'

describe('roundRobin', () => {
  test('it pulls, in order, from one stream at a time', async () => {
    expect(
      await toArray(
        roundRobin([
          delayedStream(0.3, [1, 2, 3]),
          delayedStream(0.1, ['one', 'two', 'three']),
        ]),
      ),
    ).toEqual([1, 'one', 2, 'two', 3, 'three'])
  })

  test('streams that close before others will be removed from the round robin', async () => {
    expect(
      await toArray(
        roundRobin([
          delayedStream(0.3, [1]),
          delayedStream(0.2, ['one', 'two', 'three']),
        ]),
      ),
    ).toEqual([1, 'one', 'two', 'three'])
  })

  test('cancelling the stream will cancel all upstreams', async () => {
    const oneCancel = mock()
    const one = new ReadableStream({
      pull(controller) {
        controller.enqueue(1)
      },
      cancel: oneCancel,
    })

    const twoCancel = mock()
    const two = new ReadableStream({
      pull(controller) {
        controller.enqueue(2)
      },
      cancel: twoCancel,
    })

    const three = roundRobin([one, two])
    const reader = three.getReader()
    await reader.cancel('foobar')

    expect(oneCancel).toHaveBeenCalledWith('foobar')
    expect(twoCancel).toHaveBeenCalledWith('foobar')
  })

  test('immediately closes with no streams to merge', async () => {
    const fn = mock()
    await roundRobin([]).pipeTo(write())
    expect(fn).not.toHaveBeenCalled()
  })
})
