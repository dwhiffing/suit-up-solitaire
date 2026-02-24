use std::collections::{BinaryHeap, HashSet};
use std::hash::{Hash, Hasher};
use std::sync::atomic::{AtomicU32, Ordering};
use std::time::Instant;
use rayon::prelude::*;

// --- Config ---
const PILES: usize = 11;
const RANKS: usize = 10;
const SUITS: usize = 8;
const NP: usize = PILES + SUITS;
const MD: usize = 48; // max cards per pile
const SEEDS: i32 = 1000;
const MAX_ITERS: u64 = 500_000;

// Card encoding: card = suit * RANKS + rank
fn suit(c: u8) -> u8 { c / RANKS as u8 }
fn rank(c: u8) -> u8 { c % RANKS as u8 }

// --- Mulberry32 RNG (matches JS exactly) ---
struct Rng(i32);

impl Rng {
    fn next(&mut self) -> f64 {
        self.0 = self.0.wrapping_add(0x6d2b79f5u32 as i32);
        let s = self.0;
        let mut t = (s ^ ((s as u32 >> 15) as i32)).wrapping_mul(1 | s);
        t = t.wrapping_add((t ^ ((t as u32 >> 7) as i32)).wrapping_mul(61 | t)) ^ t;
        (t ^ ((t as u32 >> 14) as i32)) as u32 as f64 / 4294967296.0
    }
}

// --- State (fixed-size, Copy) ---
#[derive(Clone, Copy)]
struct State {
    piles: [[u8; MD]; NP],
    sizes: [u8; NP],
}

impl State {
    fn new() -> Self {
        State { piles: [[0; MD]; NP], sizes: [0; NP] }
    }

    fn len(&self, p: usize) -> usize { self.sizes[p] as usize }

    fn top(&self, p: usize) -> Option<u8> {
        if self.sizes[p] == 0 { None }
        else { Some(self.piles[p][self.sizes[p] as usize - 1]) }
    }

    fn push(&mut self, p: usize, card: u8) {
        let pos = self.sizes[p] as usize;
        self.piles[p][pos] = card;
        self.sizes[p] += 1;
    }

    fn pop(&mut self, p: usize) -> u8 {
        self.sizes[p] -= 1;
        self.piles[p][self.sizes[p] as usize]
    }

    fn foundation_ok(&self, p: usize) -> bool {
        let len = self.len(p);
        len == 0 || len != 1 || rank(self.piles[p][0]) == 0 || rank(self.piles[p][0]) == RANKS as u8 - 1
    }

    fn won(&self) -> bool {
        (PILES..NP).all(|i| self.len(i) == RANKS)
    }

    fn hash_key(&self) -> u64 {
        let mut h = std::collections::hash_map::DefaultHasher::new();
        self.sizes.hash(&mut h);
        for i in 0..NP {
            self.piles[i][..self.sizes[i] as usize].hash(&mut h);
        }
        h.finish()
    }

    fn score(&self) -> i64 {
        let mut s: i64 = 0;
        for i in PILES..NP {
            let len = self.len(i);
            if len > 0 && self.foundation_ok(i) {
                s += (len * len) as i64 * 100;
            }
        }
        for i in 0..PILES {
            if self.len(i) == 0 { s -= 5; }
        }
        s
    }
}

// --- Deal cards for a seed ---
fn deal(seed: i32) -> State {
    let n = SUITS * RANKS;
    let mut deck: Vec<u8> = (0..n as u8).collect();

    let mut rng = Rng(seed);
    for i in (1..n).rev() {
        deck.swap(i, (rng.next() * (i + 1) as f64) as usize);
    }

    let chunk = (n + PILES - 1) / PILES;
    let mut state = State::new();

    for (ci, cards) in deck.chunks(chunk).enumerate() {
        let p = if ci >= PILES / 2 { ci + 1 } else { ci };
        for &card in cards {
            state.push(p, card);
        }
    }
    state
}

// --- Beam search solver (returns move path) ---
type Move = (u8, u8, u8); // (card, from, to)

struct Node {
    state: State,
    score: i64,
    moves: Vec<Move>,
}

impl Eq for Node {}
impl PartialEq for Node {
    fn eq(&self, o: &Self) -> bool { self.score == o.score }
}
impl Ord for Node {
    fn cmp(&self, o: &Self) -> std::cmp::Ordering { self.score.cmp(&o.score) }
}
impl PartialOrd for Node {
    fn partial_cmp(&self, o: &Self) -> Option<std::cmp::Ordering> { Some(self.cmp(o)) }
}

fn solve(init: State, beam: usize, noise_seed: i32) -> Option<Vec<Move>> {
    let mut q = BinaryHeap::new();
    q.push(Node { state: init, score: 0, moves: vec![] });
    let mut seen = HashSet::new();
    seen.insert(init.hash_key());
    let mut rng = Rng(noise_seed);
    let noisy = noise_seed != 0;

    for _ in 0..MAX_ITERS {
        let cur = match q.pop() {
            Some(n) => n,
            None => return None,
        };
        if cur.state.won() { return Some(cur.moves); }

        for from in 0..NP {
            let Some(card) = cur.state.top(from) else { continue };
            for to in 0..NP {
                if from == to { continue }
                if to >= PILES && !cur.state.foundation_ok(to) { continue }
                // Don't move a lone card to an empty pile (just swaps which pile is empty)
                // Exception: tableau → foundation (starts a new foundation)
                if cur.state.len(from) == 1 && cur.state.len(to) == 0
                    && !(from < PILES && to >= PILES) { continue }

                let ok = cur.state.len(to) == 0 || {
                    let top = cur.state.top(to).unwrap();
                    suit(card) == suit(top)
                        && (rank(card) as i8 - rank(top) as i8).unsigned_abs() == 1
                };
                if !ok { continue }

                let mut s = cur.state;
                s.pop(from);
                s.push(to, card);
                if !seen.insert(s.hash_key()) { continue }
                let mut sc = s.score();
                if noisy { sc += (rng.next() * 500.0) as i64; }
                let mut moves = cur.moves.clone();
                moves.push((card, from as u8, to as u8));
                q.push(Node { state: s, score: sc, moves });
            }
        }

        if q.len() > beam {
            let keep = (beam as f64 * 0.8) as usize;
            let mut kept: Vec<_> = (0..keep).filter_map(|_| q.pop()).collect();
            q.clear();
            for n in kept.drain(..) { q.push(n); }
        }
    }
    None
}

// --- Verify solution by replaying moves ---
fn verify(init: &State, moves: &[Move]) {
    let n = SUITS * RANKS;
    let mut state = *init;

    for (i, &(card, from, to)) in moves.iter().enumerate() {
        let (from, to) = (from as usize, to as usize);

        assert_eq!(state.top(from), Some(card),
            "Move {}: card {} not on top of pile {}", i, card, from);

        if to >= PILES {
            assert!(state.foundation_ok(to),
                "Move {}: foundation pile {} is disabled", i, to);
        }

        if state.len(to) > 0 {
            let dest = state.top(to).unwrap();
            assert_eq!(suit(card), suit(dest),
                "Move {}: suit mismatch {} vs {}", i, suit(card), suit(dest));
            assert_eq!((rank(card) as i8 - rank(dest) as i8).unsigned_abs(), 1,
                "Move {}: rank not adjacent {} vs {}", i, rank(card), rank(dest));
        }

        state.pop(from);
        state.push(to, card);

        let total: usize = (0..NP).map(|p| state.len(p)).sum();
        assert_eq!(total, n, "Move {}: card count {} != {}", i, total, n);
    }

    assert!(state.won(), "Solution does not reach winning state");
}


// --- Main ---
fn main() {

    let start = Instant::now();
    let done = AtomicU32::new(0);

    let solved: u32 = (0..SEEDS)
        .into_par_iter()
        .map(|seed| {
            let init = deal(seed);

            for attempt in 0..1000 {
                if let Some(moves) = solve(init, 200, (attempt + 1) * 7919) {
                    verify(&init, &moves);

                    let d = done.fetch_add(1, Ordering::Relaxed) + 1;
                    if d % 10 == 0 {
                        eprintln!("[{}/{}] {:.1}s", d, SEEDS, start.elapsed().as_secs_f64());
                    }
                    return 1;
                }
            }
            eprintln!("FAILED: seed {}", seed);
            let d = done.fetch_add(1, Ordering::Relaxed) + 1;
            if d % 10 == 0 {
                eprintln!("[{}/{}] {:.1}s", d, SEEDS, start.elapsed().as_secs_f64());
            }
            0
        })
        .sum();

    println!(
        "{:.1}% ({}/{}), {:.1}s",
        solved as f64 / SEEDS as f64 * 100.0,
        solved,
        SEEDS,
        start.elapsed().as_secs_f64()
    );
}
