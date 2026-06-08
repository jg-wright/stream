import { ControllableStream } from '@johngw/stream/sources/ControllableStream'
import { write } from '@johngw/stream/sinks/write'
import { map } from '@johngw/stream/transformers/map'
import { afterEach, beforeEach, describe, mock, test } from 'node:test'
import { throwUnlessAborted, timeout } from '@johngw/stream-common'

describe('ControllableStream', () => {
  let abortController: AbortController
  let controller: ControllableStream<number>

  beforeEach(() => {
    abortController = new AbortController()
    controller = new ControllableStream()
  })

  afterEach(() => {
    abortController.abort()
  })

  test('gives ability to enqueue messages to a stream', async ({
    assert,
    mock,
  }) => {
    const fn = mock.fn()
    controller.enqueue(1)
    controller.enqueue(2)
    const finished = controller
      .pipeTo(write(fn), { signal: abortController.signal })
      .catch(throwUnlessAborted)
    controller.enqueue(3)
    controller.enqueue(4)
    controller.close()
    await finished
    assert.equal(fn.mock.callCount(), 4)
    assert.snapshot(fn.mock.calls)
  })

  test('piping', async ({ assert, mock }) => {
    const fn = mock.fn()
    controller.enqueue(1)
    controller.enqueue(2)
    controller.close()
    await controller
      .pipeThrough(map((x) => x + 1))
      .pipeTo(write(fn), { signal: abortController.signal })
      .catch(throwUnlessAborted)
    assert.equal(fn.mock.callCount(), 2)
    assert.snapshot(fn.mock.calls)
  })

  test('back pressure', ({ assert }) => {
    assert.equal(controller.desiredSize, 1)
    controller.enqueue(1)
    assert.equal(controller.desiredSize, 0)
  })

  test('emitting errors', async ({ assert }) => {
    const promise = controller.pipeTo(write())
    controller.error(new Error('foo'))
    await assert.rejects(promise)
  })

  describe('pull subscription', () => {
    test('registering', async ({ assert }) => {
      let i = -1
      controller.onPull(() => ++i)
      controller.onPull(() => ++i)
      controller.onPull(() => ++i)

      await assert.rejects(
        controller.pipeTo(
          new WritableStream({
            write(chunk, controller) {
              if (chunk === 3) controller.error(new Error('I have enough'))
            },
          }),
        ),
        { message: 'I have enough' },
      )

      assert.equal(i, 5)
    })

    test('unsubscribing', async ({ assert, mock }) => {
      const fn = mock.fn(() => {
        unsubscribe()
        return 1
      })

      const unsubscribe = controller.onPull(fn)

      controller
        .pipeTo(write(), { signal: abortController.signal })
        .catch(throwUnlessAborted)

      await timeout(50)
      abortController.abort()

      assert.equal(fn.mock.callCount(), 1)
    })

    test('erroring listenrs will error downstream', async ({ assert }) => {
      controller.onPull(() => {
        throw new Error('foo')
      })
      await assert.rejects(controller.pipeTo(write()), { message: 'foo' })
    })
  })
})
