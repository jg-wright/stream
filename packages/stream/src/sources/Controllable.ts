/**
 * A common interface for controllable streams.
 *
 * @group Sources
 */
export interface Controllable<T> extends ReadableStreamDefaultController<T> {
  /**
   * Register a pull subscriber.
   *
   * When the stream is ready to pull it will pull from all
   * subscribers until the desired size has been fulfilled.
   */
  onPull(pullListener: ControllerPullListener<T>): () => void
}

/**
 * The pull listener type for controllables.
 *
 * @group Sources
 */
export interface ControllerPullListener<T> {
  (): T | Promise<T> | undefined
}

/**
 * An interface for a {@link ControllableStream:class}.
 *
 * @group Sources
 */
export interface ControllableReadableStream<T>
  extends ReadableStream<T>, Controllable<T> {}
