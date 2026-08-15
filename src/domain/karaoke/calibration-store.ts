// Persistência da calibração de latência em localStorage.
//
// CRÍTICO — isto NUNCA entra no estado sincronizado com o servidor
// (src/data/store.ts / src/data/sync.ts). Latência de round-trip é propriedade do
// APARELHO (placa de som, driver, se é fone ou alto-falante embutido), não da
// conta do usuário: sincronizar levaria a calibração do desktop pro celular dele, e
// todo julgamento de tempo do karaokê no celular sairia sistematicamente errado —
// pior do que não ter calibração nenhuma, porque o erro fica silencioso.

import type { CalibrationResult } from './latency'

const STORAGE_KEY = 'canto.karaoke.latency.v1'

type StoredCalibration = CalibrationResult & { at: string }
type Store = Record<string, StoredCalibration>

/** Chave por dispositivo: mesmo deviceId com sampleRate diferente (ex.: driver
 * renegociou pra 44,1 kHz) é, na prática, outro caminho de áudio — não reusa. */
export function deviceKey(sampleRate: number, inputDeviceId?: string): string {
  return `${inputDeviceId ?? 'default'}|${Math.round(sampleRate)}`
}

function readStore(): Store {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as Store
    return {}
  } catch {
    // JSON corrompido, ou localStorage bloqueado (modo privado, política do
    // browser) — trata como "sem calibração salva", nunca lança
    return {}
  }
}

function writeStore(store: Store): boolean {
  try {
    if (typeof localStorage === 'undefined') return false
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    return true
  } catch {
    // cota cheia ou localStorage indisponível — pior caso é recalibrar na
    // próxima sessão, não é motivo pra quebrar o fluxo do karaokê
    return false
  }
}

export function getCalibration(key: string): StoredCalibration | null {
  const store = readStore()
  return store[key] ?? null
}

export function saveCalibration(key: string, result: CalibrationResult): void {
  const store = readStore()
  store[key] = { ...result, at: new Date().toISOString() }
  writeStore(store)
}

export function clearCalibration(): void {
  writeStore({})
}
