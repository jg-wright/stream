import { GlobalRegistrator } from '@happy-dom/global-registrator'

export function happydom() {
  // Preserve native Bun stream implementations before Happy DOM registration
  const nativeReadableStream = globalThis.ReadableStream
  const nativeWritableStream = globalThis.WritableStream
  const nativeTransformStream = globalThis.TransformStream
  const nativeAbortController = globalThis.AbortController
  const nativeAbortSignal = globalThis.AbortSignal

  GlobalRegistrator.register()

  // Restore native Bun stream implementations (Happy DOM's aren't fully compatible)
  globalThis.ReadableStream = nativeReadableStream
  globalThis.WritableStream = nativeWritableStream
  globalThis.TransformStream = nativeTransformStream
  globalThis.AbortController = nativeAbortController
  globalThis.AbortSignal = nativeAbortSignal
}

export function unhappydom() {
  GlobalRegistrator.unregister()
}
