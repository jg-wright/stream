export const StateReducerInit = '__INIT__'
export type StateReducerInit = typeof StateReducerInit

/**
 * A collection of reducers for a State.
 *
 * @group Transformers
 * @example
 * ```
 * interface State {
 *   foos: string[]
 * }
 *
 * interface Actions {
 *   foo: string
 * }
 *
 * type Reducers = StateReducers<State, Actions>
 * // {
 * //   __INIT__: () => State,
 * //   foo: (state: State, param: string) => State,
 * // }
 * ```
 */
export type StateReducers<Actions, State> = {
  [Action in keyof Actions]: StateReducer<Actions[Action], State>
} & { [StateReducerInit](): Readonly<State> }

/**
 * A single reducer for a State.
 *
 * @group Transformers
 * @example
 * ```
 * interface State {
 *   foos: string[]
 * }
 *
 * type Reducer1 = StateReducer<string, State>
 * // (state: State, param: string) => State
 *
 * type Reducer2 = StateReducer<void, State>
 * // (state: State) => State
 * ```
 */
export type StateReducer<Param, State> = Param extends void
  ? (state: Readonly<State>) => Readonly<State>
  : (state: Readonly<State>, param: Param) => Readonly<State>
