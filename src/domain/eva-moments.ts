// "Momentos da EVA" de EVENTO — subir de nível e perder a ofensiva. Compara o
// valor atual com o último visto (guardado em localStorage; flags de ack, por
// dispositivo). PURO exceto pelo storage. Chamar UMA vez (via useState initializer).

const K_LEVEL = 'canto.eva.lastLevel'
const K_STREAK = 'canto.eva.lastStreak'

function num(key: string): number | null {
  try {
    const v = localStorage.getItem(key)
    return v == null ? null : Number(v)
  } catch {
    return null
  }
}
function set(key: string, n: number): void {
  try {
    localStorage.setItem(key, String(n))
  } catch {
    /* storage indisponível */
  }
}

/** Passe o nível atual. Retorna o nível se ele ACABOU de subir (uma vez); senão null. */
export function checkLevelUp(currentLevel: number): number | null {
  const last = num(K_LEVEL)
  if (last == null) {
    set(K_LEVEL, currentLevel) // 1ª vez: registra sem comemorar
    return null
  }
  if (currentLevel > last) {
    set(K_LEVEL, currentLevel)
    return currentLevel
  }
  if (currentLevel < last) set(K_LEVEL, currentLevel) // reset defensivo (conta nova/limpa)
  return null
}

/** Passe a ofensiva atual. true se ela ACABOU de zerar (tinha >= 3 dias). */
export function checkStreakLost(currentStreak: number): boolean {
  const last = num(K_STREAK)
  set(K_STREAK, currentStreak) // sempre atualiza o último visto
  return last != null && last >= 3 && currentStreak === 0
}
