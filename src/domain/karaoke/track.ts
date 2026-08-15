// Formato da FAIXA DE KARAOKÊ importada — o contrato entre a CLI de importação
// (scripts/import-song.ts) e o player no navegador.
//
// Invariante de compatibilidade: `notes` é `TimedNote[]`, o MESMO tipo que
// src/data/songs.ts já usa e que src/audio/songRoll.ts já sabe desenhar. Isso é o
// que permite o karaokê reaproveitar o piano-roll existente sem tocar numa linha
// dele. Qualquer mudança aqui que quebre essa forma quebra o roll junto.

import type { TimedNote } from '../../data/songs'

/** Versão do formato. Bump quando a forma mudar de modo incompatível. */
export const KARAOKE_SCHEMA = 1 as const

/**
 * Contorno contínuo de F0 da voz de referência.
 *
 * Guardado ALÉM das notas quantizadas, de propósito. As notas servem para
 * acerto/erro; o contorno serve para drift e vibrato. Usar o contorno para
 * acerto/erro seria um erro clássico: cantor profissional faz bend estilístico, e
 * você contaria ornamento como desafinação.
 */
export interface RefContour {
  /** frames por segundo, derivado do modelo — não presuma 100 */
  fps: number
  /** MIDI float por frame; null = não-vozeado ou reprovado no gate */
  midi: (number | null)[]
  /** confiança 0..1 do SwiftF0 no mesmo índice */
  conf: number[]
}

/** Trecho contínuo de canto, fechado por silêncio. Unidade do alinhamento. */
export interface KaraokePhrase {
  index: number
  startSec: number
  endSec: number
  /** índices em KaraokeTrack.notes que compõem a frase */
  noteIdx: number[]
}

/**
 * Ingredientes crus do perfil de exigência. Ficam expostos para o app poder
 * recalcular o que depende de QUEM canta sem reimportar a música.
 */
export interface SongDemandRaw {
  loMidi: number
  hiMidi: number
  rangeSemitones: number
  /** duração mediana de nota (s) */
  medianNoteSec: number
  /** fração de notas com dur > 1.2 s */
  longNotePct: number
  medianPhraseSec: number
  maxPhraseSec: number
  /** fração de transições com salto >= 5 semitons */
  leapPct: number
  /** notas por segundo cantado (densidade; proxy de agilidade) */
  notesPerSec: number
  /** fração de notas longas em que a REFERÊNCIA usa vibrato */
  vibratoNotePct: number
  /** nº de notas efetivamente medidas (as demais foram descartadas) */
  scoredNotes: number
}

/**
 * Skills cuja exigência dá para medir SÓ com as notas, sem saber quem canta.
 *
 * `passaggio` e `ressonancia` estão fora por construção: a zona de passagem depende
 * do tipo vocal do cantor e a exigência de ressonância depende da tessitura dele.
 * O app calcula essas duas em cima de `notes`, onde o tipo vocal é conhecido. O tipo
 * documenta a limitação em vez de escondê-la atrás de um número inventado.
 */
export type AbsoluteDemandSkill = 'extensao' | 'sustentacao' | 'respiracao' | 'afinacao' | 'vibrato'

/** Exigência 0..1 por eixo. 0 = a música não cobra nada disso; 1 = cobra ao extremo. */
export type SongDemand = Record<AbsoluteDemandSkill, number> & { raw: SongDemandRaw }

export interface KaraokeTrack {
  schema: typeof KARAOKE_SCHEMA
  id: string
  title: string
  artist: string
  /**
   * SHA-256 do arquivo de áudio original. O player recusa tocar se não bater —
   * um JSON alinhado a outro arquivo produziria um diagnóstico inteiro em cima de
   * tempos errados, e falharia silenciosamente.
   */
  audioSha256: string
  audioFileName: string
  durationSec: number
  /** modelo + versão do importador que geraram isto (para invalidar cache depois) */
  importer: { model: string; version: string; separator: string }
  refContour: RefContour
  notes: TimedNote[]
  phrases: KaraokePhrase[]
  demand: SongDemand
  /**
   * Fração das notas cuja referência passou no gate de confiança. Cobertura baixa é
   * problema da IMPORTAÇÃO (separação deixou resíduo, voz enterrada na mixagem), não
   * do cantor — e precisa aparecer no relatório para não ser lida como erro dele.
   */
  coveragePct: number
}

/** Nome do índice escrito pelo importador ao lado dos `.canto.json`. */
export const KARAOKE_INDEX_FILE = 'index.json'

/**
 * Uma linha do índice de faixas importadas.
 *
 * Existe porque o app não consegue listar um diretório servido estaticamente, e
 * porque baixar todos os `.canto.json` só para montar a lista custaria dezenas de
 * milhares de frames de contorno por faixa. É deliberadamente o mínimo para
 * escolher uma faixa; o contorno só é buscado depois da escolha.
 */
export interface KaraokeIndexEntry {
  id: string
  title: string
  artist: string
  durationSec: number
  audioFileName: string
  audioSha256: string
  coveragePct: number
  importedAt: string
}

export interface KaraokeIndex {
  schema: typeof KARAOKE_SCHEMA
  tracks: KaraokeIndexEntry[]
}
