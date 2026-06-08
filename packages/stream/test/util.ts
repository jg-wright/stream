import { timeout } from '@johngw/stream-common'

export function delayedStream<T>(ms: number, items: T[]) {
  return new ReadableStream<T>({
    async pull(controller) {
      if (!items.length) return controller.close()
      await timeout(ms)
      controller.enqueue(items.shift())
    },
  })
}

export type IsString<T extends string> = T
export type IsNumber<T extends number> = T
export type IsStringOrNumber<T extends string | number> = T
