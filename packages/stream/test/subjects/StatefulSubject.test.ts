import { write } from '@johngw/stream/sinks/write'
import { StatefulSubject } from '@johngw/stream/subjects/StatefulSubject'
import { beforeEach, describe, test } from 'node:test'

describe('StatefulSubject', () => {
  interface State {
    authors: string[]
  }

  type Actions = {
    'add author': string
    nothing: void
  }

  let subject: StatefulSubject<Actions, State>

  beforeEach(() => {
    subject = new StatefulSubject<Actions, State>({
      __INIT__: () => ({ authors: [] }),

      'add author': (state, author) =>
        state.authors.includes(author)
          ? state
          : {
              ...state,
              authors: [...state.authors, author],
            },

      nothing: (state) => state,
    })
  })

  test('the __INIT__ action', async ({ assert, mock }) => {
    const fn = mock.fn()
    const controller = subject.control()
    controller.close()
    await subject.fork().pipeTo(write(fn))

    assert.equal(fn.mock.callCount(), 1)
    assert.snapshot(fn.mock.calls)
  })

  test('a reducer that changes state', async ({ assert, mock }) => {
    const fn = mock.fn()
    const controller = subject.control()
    controller.dispatch('add author', 'Jane Austin')
    controller.close()
    await subject.fork().pipeTo(write(fn))

    assert.equal(fn.mock.callCount(), 2)
    assert.snapshot(fn.mock.calls)
  })

  test('a reducer that doesnt change state', async ({ assert, mock }) => {
    const fn = mock.fn()
    const controller = subject.control()
    controller.dispatch('nothing')
    controller.close()
    await subject.fork().pipeTo(write(fn))

    assert.equal(fn.mock.callCount(), 1)
    assert.snapshot(fn.mock.calls)
  })

  test('multiple calls', async ({ assert, mock }) => {
    const fn = mock.fn()
    const promise = subject.fork().pipeTo(write(fn))
    const controller = subject.control()
    controller.dispatch('add author', 'Jane Austin')
    controller.dispatch('add author', 'George Orwell')
    controller.dispatch('add author', 'Jane Austin')
    controller.close()
    await promise

    assert.equal(fn.mock.callCount(), 3)
    assert.snapshot(fn.mock.calls)
  })

  test('typing errors', ({ assert }) => {
    assert.throws(
      () =>
        new StatefulSubject<Actions, State>(
          // @ts-expect-error There is no __INIT__ method
          {
            'add author': (state) => state,
          },
        ),
    )

    new StatefulSubject<Actions, State>({
      // @ts-expect-error Incorrect state shape
      __INIT__: () => ({ mung: 'face' }),

      // @ts-expect-error Function declaration does not match action
      nothing: (state, param: string) => ({ ...state, authors: [param] }),
    })

    subject.control().close()
    return subject.fork().pipeTo(
      write((chunk) => {
        // @ts-expect-error Unknown action name
        if (chunk.action === 'unknown') {
          //
        }
      }),
    )
  })
})
