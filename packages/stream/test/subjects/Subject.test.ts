import { write } from '@johngw/stream/sinks/write'
import { Subject } from '@johngw/stream/subjects/Subject'
import { describe, test } from 'node:test'

describe('Subject', () => {
  test('ability to queue and fork from the same object', async ({
    assert,
    mock,
  }) => {
    const subject = new Subject<number>()
    const fn = mock.fn()
    const controller = subject.control()
    controller.enqueue(1)
    controller.enqueue(2)
    controller.enqueue(3)
    controller.close()
    await subject
      .fork(undefined, new CountQueuingStrategy({ highWaterMark: 3 }))
      .pipeTo(write(fn))
    assert.equal(fn.mock.callCount(), 3)
    assert.snapshot(fn.mock.calls)
  })

  test('pulling from subject', async ({ assert, mock }) => {
    const subject = new Subject<number>()
    const controller = subject.control()
    let i = 0
    controller.onPull(() => {
      if (i === 3) {
        controller.close()
        return undefined
      }
      return ++i
    })
    const fn = mock.fn()
    await subject
      .fork(undefined, new CountQueuingStrategy({ highWaterMark: 3 }))
      .pipeTo(write(fn))
    assert.snapshot(fn.mock.calls)
  })

  test('back pressure', async ({ assert }) => {
    const subject = new Subject<number>()
    const controller = subject.control()
    assert.equal(controller.desiredSize, 1)
    controller.enqueue(1)
    controller.enqueue(1)
    assert.equal(controller.desiredSize, 0)
  })

  test('erroring subjects', async ({ assert }) => {
    let errored = false
    const subject = new Subject<number>()
    const controller = subject.control()
    const promise = subject
      .fork()
      .pipeTo(write())
      .catch(() => {
        errored = true
      })
    controller.error(new Error('foo'))
    await promise
    assert.equal(errored, true)
  })

  test('multiple controllers', async ({ assert, mock }) => {
    const subject = new Subject<number>({
      controllableStrategy: new CountQueuingStrategy({ highWaterMark: 3 }),
    })
    const fn = mock.fn()
    const controller1 = subject.control()
    const controller2 = subject.control()
    const controller3 = subject.control()
    controller1.enqueue(1)
    controller2.enqueue(2)
    controller3.enqueue(3)
    controller1.close()
    controller2.close()
    controller3.close()
    await subject
      .fork(undefined, new CountQueuingStrategy({ highWaterMark: 3 }))
      .pipeTo(write(fn))
    assert.equal(fn.mock.callCount(), 3)
    assert.snapshot(fn.mock.calls)
  })
})
