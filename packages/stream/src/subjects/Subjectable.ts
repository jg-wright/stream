import type { Forkable } from '../sinks/Forkable.js'
import type { Controllable } from '../sources/Controllable.js'

/**
 * A common interface for subjects.
 *
 * @group Subjects
 */
export interface Subjectable<Input, Output = Input> extends Forkable<Output> {
  control(): Controllable<Input>
}
