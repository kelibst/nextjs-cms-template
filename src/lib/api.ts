export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit =
    options.body instanceof FormData
      ? (options.headers ?? {})
      : { 'Content-Type': 'application/json', ...(options.headers ?? {}) }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    let message = 'Request failed'
    try {
      const data = (await res.json()) as { error?: string }
      if (typeof data.error === 'string') message = data.error
    } catch { /* body was not JSON */ }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return {} as T
  return res.json() as Promise<T>
}
