type Level = 'debug' | 'info' | 'warn' | 'error'

export function log(
  level: Level,
  event: string,
  message: string,
  traceId: string | null = null
) {
  console.log(
    JSON.stringify({
      _timestamp: new Date().toISOString(),
      level,
      event,
      service_name: 'walrus-memory-agent',
      trace_id: traceId,
      span_id: null,
      message,
    })
  )
}
