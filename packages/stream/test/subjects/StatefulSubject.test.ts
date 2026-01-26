import { write } from '@johngw/stream/sinks/write'
import { StatefulSubject } from '@johngw/stream/subjects/StatefulSubject'
import { beforeEach, describe, expect, mock, test } from 'bun:test'

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

  test('the __INIT__ action', async () => {
    const fn = mock()
    const controller = subject.control()
    controller.close()
    await subject.fork().pipeTo(write(fn))

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        {
          "action": "__INIT__",
          "state": {
            "authors": [],
          },
        },
      ],
    ]
  `)
  })

  test('a reducer that changes state', async () => {
    const fn = mock()
    const controller = subject.control()
    controller.dispatch('add author', 'Jane Austin')
    controller.close()
    await subject.fork().pipeTo(write(fn))

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        {
          "action": "__INIT__",
          "state": {
            "authors": [],
          },
        },
      ],
      [
        {
          "action": "add author",
          "param": "Jane Austin",
          "state": {
            "authors": [
              "Jane Austin",
            ],
          },
        },
      ],
    ]
  `)
  })

  test('a reducer that doesnt change state', async () => {
    const fn = mock()
    const controller = subject.control()
    controller.dispatch('nothing')
    controller.close()
    await subject.fork().pipeTo(write(fn))

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        {
          "action": "__INIT__",
          "state": {
            "authors": [],
          },
        },
      ],
    ]
  `)
  })

  test('multiple calls', async () => {
    const fn = mock()
    const promise = subject.fork().pipeTo(write(fn))
    const controller = subject.control()
    controller.dispatch('add author', 'Jane Austin')
    controller.dispatch('add author', 'George Orwell')
    controller.dispatch('add author', 'Jane Austin')
    controller.close()
    await promise

    expect(fn).toHaveBeenCalledTimes(3)
    expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        {
          "action": "__INIT__",
          "state": {
            "authors": [],
          },
        },
      ],
      [
        {
          "action": "add author",
          "param": "Jane Austin",
          "state": {
            "authors": [
              "Jane Austin",
            ],
          },
        },
      ],
      [
        {
          "action": "add author",
          "param": "George Orwell",
          "state": {
            "authors": [
              "Jane Austin",
              "George Orwell",
            ],
          },
        },
      ],
    ]
  `)
  })

  test('typing errors', () => {
    expect(
      () =>
        new StatefulSubject<Actions, State>(
          // @ts-expect-error There is no __INIT__ method
          {
            'add author': (state) => state,
          },
        ),
    ).toThrow()

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
