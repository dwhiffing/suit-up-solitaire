import { NUM_RANKS, PILE_COUNT } from './constants'
import { seededRandom, seededShuffle } from './seededShuffle'

const NP = PILE_COUNT + 8
const MD = 48

const cardSuit = (c: number) => (c / NUM_RANKS) | 0
const cardRank = (c: number) => c % NUM_RANKS

type State = { piles: Uint8Array; sizes: Uint8Array }

const newState = (): State => ({
  piles: new Uint8Array(NP * MD),
  sizes: new Uint8Array(NP),
})

const cloneState = (s: State): State => ({
  piles: new Uint8Array(s.piles),
  sizes: new Uint8Array(s.sizes),
})

const pLen = (s: State, p: number) => s.sizes[p]

const pTop = (s: State, p: number): number =>
  s.sizes[p] === 0 ? -1 : s.piles[p * MD + s.sizes[p] - 1]

const pPush = (s: State, p: number, c: number) => {
  s.piles[p * MD + s.sizes[p]] = c
  s.sizes[p]++
}

const pPop = (s: State, p: number) => {
  s.sizes[p]--
  return s.piles[p * MD + s.sizes[p]]
}

function foundationOk(s: State, p: number) {
  const l = pLen(s, p)
  return (
    l === 0 ||
    l !== 1 ||
    cardRank(s.piles[p * MD]) === 0 ||
    cardRank(s.piles[p * MD]) === NUM_RANKS - 1
  )
}

function isWon(s: State, suitCount: number) {
  for (let i = PILE_COUNT; i < PILE_COUNT + suitCount; i++)
    if (pLen(s, i) !== NUM_RANKS) return false
  return true
}

function hashState(s: State): number {
  let h = 0x811c9dc5
  for (let i = 0; i < NP; i++) {
    h = Math.imul(h ^ s.sizes[i], 0x01000193)
    const base = i * MD
    for (let j = 0; j < s.sizes[i]; j++)
      h = Math.imul(h ^ s.piles[base + j], 0x01000193)
  }
  return h
}

function score(s: State): number {
  let sc = 0
  for (let i = PILE_COUNT; i < NP; i++) {
    const l = pLen(s, i)
    if (l > 0 && foundationOk(s, i)) sc += l * l * 100
  }
  for (let i = 0; i < PILE_COUNT; i++) if (pLen(s, i) === 0) sc -= 5
  return sc
}

function deal(seed: number, suitCount: number): State {
  const n = suitCount * NUM_RANKS
  const deck = seededShuffle(
    Array.from({ length: n }, (_, i) => i),
    seed,
  )
  const chunk = Math.ceil(n / PILE_COUNT)
  const state = newState()
  let ci = 0
  for (let start = 0; start < n; start += chunk, ci++) {
    const p = ci >= PILE_COUNT >> 1 ? ci + 1 : ci
    for (let j = start; j < Math.min(start + chunk, n); j++)
      pPush(state, p, deck[j])
  }
  return state
}

type SolverMove = { card: number; from: number; to: number }

function solve(
  init: State,
  noiseSeed: number,
  suitCount: number,
): SolverMove[] | null {
  let queue: { state: State; score: number; moves: SolverMove[] }[] = [
    { state: init, score: 0, moves: [] },
  ]
  const seen = new Set<number>([hashState(init)])
  const rng = noiseSeed !== 0 ? seededRandom(noiseSeed) : null

  for (let iter = 0; iter < 1000; iter++) {
    if (queue.length === 0) return null

    let best = 0
    for (let i = 1; i < queue.length; i++)
      if (queue[i].score > queue[best].score) best = i
    const cur = queue[best]
    queue[best] = queue[queue.length - 1]
    queue.pop()

    if (isWon(cur.state, suitCount)) return cur.moves

    for (let from = 0; from < NP; from++) {
      const card = pTop(cur.state, from)
      if (card === -1) continue

      for (let to = 0; to < NP; to++) {
        if (from === to) continue
        if (to >= PILE_COUNT && !foundationOk(cur.state, to)) continue
        if (
          pLen(cur.state, from) === 1 &&
          pLen(cur.state, to) === 0 &&
          !(from < PILE_COUNT && to >= PILE_COUNT)
        )
          continue

        const t = pTop(cur.state, to)
        if (
          t !== -1 &&
          (cardSuit(card) !== cardSuit(t) ||
            Math.abs(cardRank(card) - cardRank(t)) !== 1)
        )
          continue

        const s = cloneState(cur.state)
        pPop(s, from)
        pPush(s, to, card)
        const h = hashState(s)
        if (seen.has(h)) continue
        seen.add(h)

        let sc = score(s)
        if (rng) sc += rng() * 500
        queue.push({
          state: s,
          score: sc,
          moves: [...cur.moves, { card, from, to }],
        })
      }
    }

    if (queue.length > 200) {
      queue.sort((a, b) => b.score - a.score)
      queue.length = 160
    }
  }

  return null
}

const NOISE_SEEDS = [0, 7919, 15838]

function solveWithRetries(init: State, suitCount: number) {
  for (const noise of NOISE_SEEDS) {
    const moves = solve(init, noise, suitCount)
    if (moves) return moves
  }
  return null
}

export interface ReplayMove {
  from: number
  to: number
  fromCardId: number
  toCardId: number | null
  toPile: number | null
}

export function solveFromPosition(
  cards: CardType[],
  suitCount: number,
): ReplayMove[] | null {
  const state = newState()
  for (const card of [...cards].sort(
    (a, b) => a.cardPileIndex - b.cardPileIndex,
  )) {
    pPush(state, card.pileIndex, card.suit * NUM_RANKS + card.rank)
  }

  const solverMoves = solveWithRetries(state, suitCount)
  if (!solverMoves) return null

  const cardIdMap = new Map<number, number>()
  for (const card of cards) {
    cardIdMap.set(card.suit * NUM_RANKS + card.rank, card.id)
  }

  const sim = cloneState(state)
  return solverMoves.map((m) => {
    const toTop = pTop(sim, m.to)
    const move = {
      from: m.from,
      to: m.to,
      fromCardId: cardIdMap.get(m.card)!,
      toCardId: toTop === -1 ? null : cardIdMap.get(toTop)!,
      toPile: toTop === -1 ? m.to : null,
    }
    pPop(sim, m.from)
    pPush(sim, m.to, m.card)
    return move
  })
}

export function findSolvableSeed(suitCount: number): number {
  const start = Date.now()

  if (suitCount < 7) return start

  for (let i = 0; i < 100; i++) {
    const seed = (start + i) | 0
    if (solveWithRetries(deal(seed, suitCount), suitCount)) return seed
  }

  return start
}
