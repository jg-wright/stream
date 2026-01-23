export function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function isTimeoutError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'TimeoutError'
}

export function throwUnlessAborted(error: unknown) {
  if (!isAbortError(error)) throw error
}

export function throwUnlessTimeout(error: unknown) {
  if (!isTimeoutError(error)) throw error
}
