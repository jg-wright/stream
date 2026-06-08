export function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

export function isTimeoutError(error: unknown) {
  return error instanceof Error && error.name === 'TimeoutError'
}

export function throwUnlessAborted(error: unknown) {
  if (!isAbortError(error)) throw error
}

export function throwUnlessTimeout(error: unknown) {
  if (!isTimeoutError(error)) throw error
}
