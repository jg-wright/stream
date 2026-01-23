import type { Forkable } from '../sinks/Forkable'
import type { Controllable } from '../sources/Controllable'

/**
 * A common interface for subjects.
 *
 * @group Subjects
 */
export interface Subjectable<Input, Output = Input> extends Forkable<Output> {
  control(): Controllable<Input>
}
