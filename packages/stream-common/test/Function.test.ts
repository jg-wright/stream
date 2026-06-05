import { describe, test } from 'node:test'
import { check, checks, type Fail, type Pass } from '@johngw/stream-common/Test'
import type { Accumulator, Predicate } from '@johngw/stream-common/Function'

describe('Function', () => {
  test('Accumulator', () => {
    checks([
      check<
        Accumulator<number, number[]>,
        (accumulation: number[], chunk: number) => number[] | Promise<number[]>,
        Pass
      >(),

      check<
        Accumulator<number, string>,
        (accumulation: string, chunk: number) => string | Promise<string>,
        Pass
      >(),

      check<
        Accumulator<number, string>,
        (accumulation: string, chunk: number) => void,
        Fail
      >(),

      check<
        Accumulator<number, string>,
        (accumulation: string, chunk: number) => string,
        Fail
      >(),
    ])
  })

  test('Predicate', () => {
    checks([
      check<
        Predicate<string>,
        (x: string) => boolean | Promise<boolean>,
        Pass
      >(),

      check<Predicate<string>, (x: string) => boolean, Fail>(),
    ])
  })
})
