// Guarda de CI da voz da EVA (tarefa A6). Falha (exit 1) se:
//   (a) alguma VOZ ESTÁTICA voltada ao aluno usar um rótulo proibido, ou
//   (b) o system prompt versionado não contiver a regra anti-vergonha (MPA-safe).
//
// Casa por LIMITE DE PALAVRA (\b) — evita "desafinad" pegar mid-word e evita casar
// substrings acidentais. Usa o radical "desafinad" (desafinado/a/os/as, o rótulo)
// sem pegar "desafinação" (o conceito, discutido de forma tranquilizadora). Não roda
// o LLM — checa só o determinístico no repo. Rode: npm run test:eva
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Radicais/frases proibidos (mirror de BANNED_LABELS em src/domain/eva-voice/prompt.ts).
const BANNED = [
  'desafinad',
  'você falhou',
  'voce falhou',
  'você fracassou',
  'voce fracassou',
  'sem talento',
  'você é ruim',
  'voce é ruim',
  'incapaz',
]
const MARKER = 'NUNCA rotule o aluno de "desafinado"'

// Vozes ESTÁTICAS voltadas ao aluno (o diagnose determinístico + o fallback do Coach).
const STATIC_VOICES = ['src/data/coaching.ts', 'src/pages/Coach.tsx']
const PROMPT_FILE = 'src/domain/eva-voice/prompt.ts'

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const matcher = (term) => new RegExp('\\b' + esc(term), 'i')

const problems = []
for (const rel of STATIC_VOICES) {
  const text = readFileSync(join(root, rel), 'utf8')
  for (const term of BANNED) {
    if (matcher(term).test(text)) {
      problems.push(`${rel}: usa o rótulo proibido "${term}" numa voz voltada ao aluno`)
    }
  }
}

const prompt = readFileSync(join(root, PROMPT_FILE), 'utf8')
if (!prompt.includes(MARKER)) {
  problems.push(`${PROMPT_FILE}: falta a regra anti-vergonha ("${MARKER}")`)
}

if (problems.length) {
  console.error('✖ Guarda da voz da EVA FALHOU:')
  for (const p of problems) console.error('  - ' + p)
  console.error(
    '\nA EVA nunca rotula o aluno (pesquisa P1). Reescreva a cópia com encorajamento + a próxima micro-ação.',
  )
  process.exit(1)
}

console.log('✓ Voz da EVA ok: nenhuma cópia estática rotula o aluno; o prompt tem a regra anti-vergonha.')
