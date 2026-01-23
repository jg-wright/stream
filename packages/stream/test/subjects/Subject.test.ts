import { write } from '@johngw/stream/sinks/write'
import { Subject } from '@johngw/stream/subjects/Subject'
import { expect, mock, test } from 'bun:test'

test('ability to queue and fork from the same object', async () => {
  const subject = new Subject<number>()
  const fn = mock()
  const controller = subject.control()
  controller.enqueue(1)
  controller.enqueue(2)
  controller.enqueue(3)
  controller.close()
  await subject.fork().pipeTo(write(fn))
  expect(fn).toHaveBeenCalledTimes(3)
  expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        1,
      ],
      [
        2,
      ],
      [
        3,
      ],
    ]
  `)
})

test('pulling from subject', async () => {
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
  const fn = mock()
  await subject.fork().pipeTo(write(fn))
  expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        1,
      ],
      [
        2,
      ],
      [
        3,
      ],
    ]
  `)
})

test('back pressure', async () => {
  const subject = new Subject<number>()
  const controller = subject.control()
  expect(controller.desiredSize).toBe(1)
  controller.enqueue(1)
  expect(controller.desiredSize).toBe(0)
})

test('erroring subjects', async () => {
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
  expect(errored).toBe(true)
})

test('multiple controllers', async () => {
  const subject = new Subject<number>()
  const fn = mock()
  const controller1 = subject.control()
  const controller2 = subject.control()
  const controller3 = subject.control()
  controller1.enqueue(1)
  controller2.enqueue(2)
  controller3.enqueue(3)
  controller1.close()
  controller2.close()
  controller3.close()
  await subject.fork().pipeTo(write(fn))
  expect(fn).toHaveBeenCalledTimes(3)
  expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        1,
      ],
      [
        2,
      ],
      [
        3,
      ],
    ]
  `)
})
