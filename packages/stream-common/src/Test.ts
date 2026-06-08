import type { Boolean as B } from 'ts-toolbelt/out/Boolean/_Internal.js'
import type { Equals } from 'ts-toolbelt/out/Any/Equals.js'
import type { Test } from 'ts-toolbelt'

/**
 * Type checking test.
 *
 * @example
 * ```
 * checks([
 *   check<1, number, Pass>(),
 *   check<'foo', boolean, Fail>(),
 * ])
 * ```
 */
export function check<Type, Expect, Outcome extends B>(
  _debug?: Type,
): Equals<Equals<Type, Expect>, Outcome> {
  return 1 as Equals<Equals<Type, Expect>, Outcome>
}

export function checks(_checks: 1[]) {
  //
}

export type Fail = Test.Fail
export type Pass = Test.Pass
