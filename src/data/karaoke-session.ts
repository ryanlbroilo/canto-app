// Sessão de karaokê em memória — a ponte entre a tela de preparo (/karaoke) e a
// de cantar (/karaoke/:id).
//
// Vive num módulo, e não no estado do React, por dois motivos: carrega uma
// object URL que precisa ser revogada explicitamente (deixar para o coletor de
// lixo prende o arquivo inteiro na memória), e é intencionalmente VOLÁTIL — um
// F5 exige escolher o arquivo de novo. Isso não é um defeito: o app não guarda
// áudio do usuário em lugar nenhum, nem em cache do browser.

import type { PhraseAlignment } from '../domain/karaoke/align'
import type { Attribution } from '../domain/karaoke/attribute'
import type { SungNote } from '../domain/karaoke/measure'
import type { KaraokeTrack } from '../domain/karaoke/track'
import type { Verdict } from '../domain/karaoke/verdict'
import type { KaraokeNext } from './karaoke-next'

export interface KaraokeSession {
  track: KaraokeTrack
  /** object URL do arquivo de áudio escolhido nesta sessão */
  audioUrl: string
  audioFileName: string
  /** ida-e-volta medido (ms); 0 quando o usuário escolheu seguir sem calibrar */
  latencyMs: number
  /** o SHA-256 do arquivo bateu com o da importação */
  hashVerified: boolean
}

export interface KaraokeRun {
  trackId: string
  notes: SungNote[]
  alignments: PhraseAlignment[]
  attribution: Attribution
  /** de quem é a conta de cada achado, e se a música cabe na voz */
  verdict: Verdict
  /** a única tarefa que sai da corrida; null quando nada sustenta recomendação */
  next: KaraokeNext | null
  latencyMs: number
  hashVerified: boolean
}

let current: KaraokeSession | null = null
let lastRun: KaraokeRun | null = null

export function getKaraokeSession(): KaraokeSession | null {
  return current
}

export function setKaraokeSession(session: KaraokeSession): void {
  if (current && current.audioUrl !== session.audioUrl) URL.revokeObjectURL(current.audioUrl)
  current = session
}

export function clearKaraokeSession(): void {
  if (current) URL.revokeObjectURL(current.audioUrl)
  current = null
}

export function getKaraokeRun(): KaraokeRun | null {
  return lastRun
}

export function setKaraokeRun(run: KaraokeRun): void {
  lastRun = run
}
