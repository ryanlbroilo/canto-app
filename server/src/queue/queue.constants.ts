// Nomes de fila e jobs (compartilhados entre produtor e worker).
export const SESSIONS_QUEUE = 'sessions'
export const JOB_PROCESS_SESSION = 'process-session'

export interface ProcessSessionJob {
  sessionId: string
  tenantId: string
}
