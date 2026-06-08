import type { L, U } from 'ts-toolbelt'
import type { StateReducerInit } from './Reducers.js'

/**
 * Represents the Readable (input) types of StateReducer actions.
 *
 * @group Transformers
 * @example
 * ```
 * type T = StateReducerInput<{ foo: string, bar: number, nothing: void }>
 * // | { action: '__INIT__', param: void }
 * // | { action: 'foo', param: string }
 * // | { action: 'bar', param: number }
 * // | { action: 'nothing', param: void }
 * ```
 */
export type StateReducerInput<Actions extends Record<string, unknown>> =
  AccumulateStateReducerInput<
    Actions,
    U.ListOf<keyof Actions>,
    { action: StateReducerInit; param: void }
  >

/**
 * {@inheritdoc StateReducerInput}
 */
type AccumulateStateReducerInput<
  Actions extends Record<string, unknown>,
  ActionNames extends readonly (keyof Actions)[],
  Acc extends { action: keyof Actions; param: unknown },
> = ActionNames['length'] extends 0
  ? Acc
  : AccumulateStateReducerInput<
      Actions,
      L.Tail<ActionNames>,
      | Acc
      | {
          action: L.Head<ActionNames>
          param: Actions[L.Head<ActionNames>]
        }
    >
