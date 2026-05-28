/**
 * Queues a stream of DOM mutations' added nodes.
 *
 * @group Transformers
 * @see {@link fromDOMMutations:function}
 * @example
 * ```ts
 * --<MutationRecord>------------------
 *
 * addedNodes()
 *
 * --------------------<Node>--<Node>--
 * ```
 */
export function addedNodes() {
  return new TransformStream<MutationRecord, Node>({
    transform({ addedNodes }, controller) {
      for (let i = 0; i < addedNodes.length; i++)
        controller.enqueue(addedNodes[i])
    },
  })
}
