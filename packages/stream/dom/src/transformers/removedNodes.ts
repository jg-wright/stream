/**
 * Queues a stream of DOM mutations' removed nodes.
 *
 * @group Transformers
 * @see {@link fromDOMMutations:function}
 * @example
 * ```ts
 * --<MutationRecord>------------------
 *
 * removedNodes()
 *
 * --------------------<Node>--<Node>--
 * ```
 */
export function removedNodes() {
  return new TransformStream<MutationRecord, Node>({
    transform({ removedNodes }, controller) {
      for (let i = 0; i < removedNodes.length; i++)
        controller.enqueue(removedNodes[i])
    },
  })
}
