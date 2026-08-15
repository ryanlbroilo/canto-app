// Acesso do app às faixas de karaokê importadas pela CLI.
//
// As faixas moram em `public/karaoke/` (fora do git — um `.canto.json` é a
// transcrição da melodia de uma gravação comercial). O áudio NÃO mora lá: ele é
// escolhido do disco pelo usuário a cada sessão e nunca sai do aparelho.

import {
  KARAOKE_INDEX_FILE,
  KARAOKE_SCHEMA,
  type KaraokeIndex,
  type KaraokeIndexEntry,
  type KaraokeTrack,
} from '../domain/karaoke/track'

const TRACKS_BASE = '/karaoke'

/**
 * Lê o índice de faixas importadas.
 *
 * Devolve lista vazia quando não há nada importado — inclusive quando o servidor
 * responde o index.html do SPA no lugar do JSON ausente, que é o caso NORMAL na
 * primeira execução e não um erro a se propagar.
 */
export async function loadKaraokeIndex(): Promise<KaraokeIndexEntry[]> {
  let res: Response
  try {
    res = await fetch(`${TRACKS_BASE}/${KARAOKE_INDEX_FILE}`, { cache: 'no-cache' })
  } catch {
    return []
  }
  if (!res.ok) return []
  const text = await res.text()
  try {
    const parsed = JSON.parse(text) as Partial<KaraokeIndex>
    if (parsed.schema !== KARAOKE_SCHEMA || !Array.isArray(parsed.tracks)) return []
    return parsed.tracks
  } catch {
    return []
  }
}

export async function loadKaraokeTrack(id: string): Promise<KaraokeTrack> {
  const res = await fetch(`${TRACKS_BASE}/${encodeURIComponent(id)}.canto.json`, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`faixa "${id}" não encontrada`)
  const track = (await res.json()) as KaraokeTrack
  if (track.schema !== KARAOKE_SCHEMA) {
    throw new Error(`faixa "${id}" foi importada por outra versão — importe de novo`)
  }
  return track
}

/** `true` quando dá para calcular SHA-256 aqui (exige contexto seguro). */
export function canHashLocally(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle?.digest === 'function'
}

/** SHA-256 de um arquivo local, em hexadecimal minúsculo — o mesmo formato que a CLI grava. */
export async function sha256OfFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
