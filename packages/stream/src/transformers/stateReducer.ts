import type { StateReducerInput } from './stateReducer/Input'
import type { StateReducerOutput } from './stateReducer/Output'
import {
  type StateReducer,
  StateReducerInit,
  type StateReducers,
} from './stateReducer/Reducers'

export type {
  StateReducerInput,
  StateReducerOutput,
  StateReducer,
  StateReducers,
}

/**
 * Consumes actions and queues changes to a piece state with provided reducers.
 *
 * It's important to note that if the result of an action does not change
 * the state then nothing is queued to the stream.
 *
 * @group Transformers
 * @see {@link StatefulSubject:class}
 * @example
 * ```
 * ---------------{'add author','Jane Austin'}--|
 *
 * stateReducer({
 *   __INIT__: () => ({ authors: [] }),
 *   'add author': (state, author) => ({
 *     ...state,
 *     authors: [...state.authors, author]
 *   })
 * })
 *
 * --{authors:[]}--{authors:['Jane Austin']}-----
 * ```
 *
 * @example
 * ```
 * // The State will be the type of data you want to manipulate.
 * interface State {
 *   authors: string[]
 * }
 *
 * // The Actions are a record of "action name" to a parameter.
 * // If the action doesn't require a parameter, use `void`.
 * type Actions = {
 *   'add author': string
 *   'action that doesnt need a parameter': void
 * }
 *
 * const controllable = new ControllableStream<StateReducerInput<Actions>>()
 *
 * // To get the best out of this API, pass the Actions type and State
 * // during invocation.
 * controllable
 *   .pipeThrough(stateReducer<Actions, State>(
 *     {
 *       __INIT__: () => ({ authors: [] }),
 *
 *       'add author': (state, author) => state.authors.includes(author) ? state : {
 *          ...state,
 *          authors: [...state.authors, author],
 *       },
 *
 *       'action that doesnt need a parameter': (state) => state
 *     }
 *   ))
 *   .pipeTo(write(console.info))
 * // { action: '__INIT__', state: { authors: [] } }
 *
 * controllable.enqueue({ action: 'add author', param: 'Jane Austin' })
 * // { action: 'add author', param: 'Jane Austin', state: { authors: ['Jane Austin'] } }
 *
 * controllable.enqueue({ action: 'add author', param: 'Jane Austin' })
 * // **Nothing will be queued as the state did not change.**
 * ```
 */
export function stateReducer<Actions extends Record<string, unknown>, State>(
  reducers: StateReducers<Actions, State>
) {
  let state = Object.freeze(reducers[StateReducerInit]())

  return new TransformStream<
    StateReducerInput<Actions>,
    StateReducerOutput<Actions, State>
  >({
    start(controller) {
      controller.enqueue({
        action: StateReducerInit,
        state,
      } as StateReducerOutput<Actions, State>)
    },

    transform(chunk, controller) {
      let $state: State
      try {
        $state = reducers[(chunk as any).action]!(state, (chunk as any).param)
      } catch (error) {
        return controller.error(error)
      }
      if ($state !== state) {
        state = Object.freeze($state)
        controller.enqueue({
          ...chunk,
          state,
        } as StateReducerOutput<Actions, State>)
      }
    },
  })
}
