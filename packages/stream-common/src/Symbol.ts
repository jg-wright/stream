/**
 * A hidden Symbol that we can use to determine if something
 * hasn't been set.
 *
 * Why not use `undefined` or `null`?
 * Because someone may have wanted to set the value to `undefined`
 * or `null`.
 *
 * @hidden
 * @group Utils
 * @category Symbol
 */
export const empty = Symbol('empty')

/**
 * {@inheritdoc empty}
 */
export type Empty = typeof empty
