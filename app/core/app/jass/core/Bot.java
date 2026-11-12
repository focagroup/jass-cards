package app.jass.core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/**
 * Card play for computer players.
 *   easy   - mostly the heuristic, sometimes a random legal card
 *   normal - the heuristic (follows the game's desire: take or avoid points)
 *   hard   - Monte-Carlo: samples the unseen cards and plays every option out with the heuristic
 * Bots only look at their own hand and the cards already played.
 */
public final class Bot {
    private Bot() {}

    public static int chooseCard(TrickGame g, Deal d, int seat, int level, Random rng) {
        List<Integer> legal = d.legal(seat);
        if (legal.size() == 1) return legal.get(0);
        if (level == 0 && rng.nextInt(100) < 35) return legal.get(rng.nextInt(legal.size()));
        if (level >= 2) return pimc(g, d, seat, legal, rng, 28);
        return heuristic(g, d, seat);
    }

    // ------------------------------------------------------------------ heuristic

    private static boolean isTrump(Mode m, int c) {
        int t = m.trumpSuit();
        return t >= 0 && Cards.suit(c) == t;
    }

    /** Cost of giving a card away: trumps and points are expensive, weak cards cheap. */
    private static int cost(Deal d, int c) {
        return (isTrump(d.mode, c) ? 1000 : 0) + d.mode.points(c) * 10 + d.mode.strength(c, d.trickNo) % 100;
    }

    private static int cheapest(Deal d, List<Integer> cards) {
        int best = cards.get(0);
        for (int c : cards) if (cost(d, c) < cost(d, best)) best = c;
        return best;
    }

    /** No unseen card of the same suit can beat this one (from the seat's point of view). */
    static boolean isMaster(Deal d, int card, int seat) {
        int s = Cards.suit(card);
        int st = d.mode.strength(card, d.trickNo);
        for (int r = 0; r < 9; r++) {
            int x = Cards.id(s, r);
            if (x == card % 36 || d.played[x] || d.hands[seat].contains(x)) continue;
            boolean inTrick = false;
            for (int i = 0; i < d.trickSize; i++) if (d.trickCards[i] % 36 == x) inTrick = true;
            if (inTrick) continue;
            if (d.mode.strength(x, d.trickNo) > st) return false;
        }
        return true;
    }

    /** Unseen trumps that others may still hold. */
    private static int trumpsOut(Deal d, int seat) {
        int t = d.mode.trumpSuit();
        if (t < 0) return 0;
        int k = 0;
        for (int r = 0; r < 9; r++) {
            int x = Cards.id(t, r);
            if (!d.played[x] && !d.hands[seat].contains(x)) k++;
        }
        return k;
    }

    public static int heuristic(TrickGame g, Deal d, int seat) {
        List<Integer> legal = d.legal(seat);
        if (legal.size() == 1) return legal.get(0);
        int want = g.desire(d, seat);
        Mode m = d.mode;
        if (d.trickSize == 0) return lead(g, d, seat, legal, want);

        int wi = d.winnerIndex();
        int wSeat = d.trickSeats[wi];
        boolean partnerWins = wSeat != seat && g.side(wSeat) == g.side(seat);
        boolean last = d.trickSize == d.n - 1;
        int trickPts = 0;
        for (int i = 0; i < d.trickSize; i++) trickPts += m.points(d.trickCards[i]);
        List<Integer> winners = new ArrayList<>(), losers = new ArrayList<>();
        for (int c : legal) (d.wouldWin(c) ? winners : losers).add(c);

        if (want > 0) {
            if (partnerWins) {
                int wc = d.trickCards[wi];
                boolean safe = last || (isMaster(d, wc, seat) && (isTrump(m, wc) || trumpsOut(d, seat) == 0 || Cards.suit(wc) == d.ledSuit()));
                if (safe) {
                    // schmieren: give the partner points, but not trumps
                    int best = -1;
                    for (int c : legal) {
                        if (isTrump(m, c) && legal.size() > 1) continue;
                        if (best < 0 || m.points(c) > m.points(best) || (m.points(c) == m.points(best) && cost(d, c) < cost(d, best))) best = c;
                    }
                    if (best >= 0) return best;
                }
                return cheapest(d, losers.isEmpty() ? legal : losers);
            }
            if (!winners.isEmpty()) {
                if (last) return cheapestWinner(d, winners, trickPts);
                List<Integer> masters = new ArrayList<>();
                for (int c : winners) {
                    boolean trumpSafe = isTrump(m, c) || trumpsOut(d, seat) == 0 || allVoidFree(d, seat);
                    if (isMaster(d, c, seat) && trumpSafe) masters.add(c);
                }
                if (!masters.isEmpty() && (trickPts >= 8 || m.points(cheapest(d, masters)) >= 10)) return cheapest(d, masters);
                if (trickPts >= 10) {
                    int best = winners.get(0);
                    for (int c : winners) if (m.strength(c, d.trickNo) > m.strength(best, d.trickNo)) best = c;
                    if (!isTrump(m, best) || trickPts >= 14) return best;
                }
            }
            return cheapest(d, losers.isEmpty() ? legal : losers);
        }
        // want < 0: avoid tricks and points
        if (!losers.isEmpty()) {
            int best = losers.get(0);
            for (int c : losers) {
                int a = m.strength(c, d.trickNo) * 4 + m.points(c), b = m.strength(best, d.trickNo) * 4 + m.points(best);
                if (a > b) best = c;
            }
            return best;
        }
        // forced to take it: get rid of the strongest card (or the cheapest if last)
        if (last) return cheapest(d, winners);
        int best = winners.get(0);
        for (int c : winners) if (m.strength(c, d.trickNo) > m.strength(best, d.trickNo)) best = c;
        return best;
    }

    /** Nobody still to play in this trick is known to lack the led suit (so nobody can ruff for sure). */
    private static boolean allVoidFree(Deal d, int seat) {
        int led = d.ledSuit();
        int remaining = d.n - d.trickSize - 1;
        for (int k = 1; k <= remaining; k++) if (d.voids[(seat + k) % d.n][led]) return false;
        return true;
    }

    private static int cheapestWinner(Deal d, List<Integer> winners, int trickPts) {
        int best = winners.get(0);
        for (int c : winners) {
            int a = (isTrump(d.mode, c) ? 300 : 0) + d.mode.strength(c, d.trickNo) % 100;
            int b = (isTrump(d.mode, best) ? 300 : 0) + d.mode.strength(best, d.trickNo) % 100;
            if (a < b) best = c;
        }
        if (isTrump(d.mode, best) && trickPts == 0 && d.mode.points(best) >= 10) return cheapest(d, d.legal(d.turn));
        return best;
    }

    private static int lead(TrickGame g, Deal d, int seat, List<Integer> legal, int want) {
        Mode m = d.mode;
        if (want > 0) {
            int t = m.trumpSuit();
            if (t >= 0 && trumpsOut(d, seat) > 0) {
                for (int c : legal) if (Cards.suit(c) == t && isMaster(d, c, seat)) return c;
            }
            int best = -1;
            for (int c : legal) {
                if (isTrump(m, c)) continue;
                if (!isMaster(d, c, seat)) continue;
                if (best < 0 || m.points(c) > m.points(best)) best = c;
            }
            if (best >= 0) return best;
            // low card from the longest side suit
            int[] len = new int[4];
            for (int c : d.hands[seat]) len[Cards.suit(c)]++;
            List<Integer> pool = new ArrayList<>();
            int longest = -1;
            for (int s = 0; s < 4; s++) if (s != t && len[s] > 0 && (longest < 0 || len[s] > len[longest])) longest = s;
            for (int c : legal) if (Cards.suit(c) == longest) pool.add(c);
            return cheapest(d, pool.isEmpty() ? legal : pool);
        }
        // avoid tricks: lead the card with the most unseen higher cards
        int best = legal.get(0), bestScore = -99;
        for (int c : legal) {
            int s = Cards.suit(c), higher = 0;
            for (int r = 0; r < 9; r++) {
                int x = Cards.id(s, r);
                if (d.played[x] || d.hands[seat].contains(x)) continue;
                if (m.strength(x, d.trickNo) > m.strength(c, d.trickNo)) higher++;
            }
            int score = higher * 10 - m.points(c) - (isTrump(m, c) ? 30 : 0);
            if (score > bestScore) { bestScore = score; best = c; }
        }
        return best;
    }

    // ------------------------------------------------------------------ simulation

    /** Plays the deal to the end with the heuristic for everybody. */
    public static void rollout(TrickGame g, Deal d) {
        int guard = 0;
        while (!d.done() && guard++ < 200) d.play(heuristic(g, d, d.turn));
    }

    /**
     * A copy of the deal in which the cards the seat cannot see are redistributed at random among
     * the other players (same hand sizes, respecting suits they are known to lack).
     */
    public static Deal sampleWorld(Deal d, int seat, Random rng) {
        Deal w = d.copy();
        List<Integer> pool = new ArrayList<>();
        int[] need = new int[d.n];
        for (int s = 0; s < d.n; s++) {
            if (s == seat) continue;
            pool.addAll(w.hands[s]);
            need[s] = w.hands[s].size();
            w.hands[s].clear();
        }
        for (int attempt = 0; attempt < 12; attempt++) {
            Collections.shuffle(pool, rng);
            int[] left = need.clone();
            List<Integer>[] tmp = newLists(d.n);
            boolean ok = true;
            for (int c : pool) {
                List<Integer> cand = new ArrayList<>();
                for (int s = 0; s < d.n; s++) if (s != seat && left[s] > 0 && !d.voids[s][Cards.suit(c)]) cand.add(s);
                if (cand.isEmpty()) { ok = false; break; }
                // prefer seats with the most room so that constrained seats keep options
                int pick = cand.get(rng.nextInt(cand.size()));
                tmp[pick].add(c);
                left[pick]--;
            }
            if (ok) {
                for (int s = 0; s < d.n; s++) if (s != seat) w.hands[s].addAll(tmp[s]);
                return w;
            }
        }
        int i = 0;
        for (int s = 0; s < d.n; s++) {
            if (s == seat) continue;
            for (int k = 0; k < need[s]; k++) w.hands[s].add(pool.get(i++));
        }
        return w;
    }

    @SuppressWarnings("unchecked")
    private static List<Integer>[] newLists(int n) {
        List<Integer>[] a = new List[n];
        for (int i = 0; i < n; i++) a[i] = new ArrayList<>();
        return a;
    }

    private static int pimc(TrickGame g, Deal d, int seat, List<Integer> legal, Random rng, int samples) {
        double[] score = new double[legal.size()];
        for (int k = 0; k < samples; k++) {
            Deal w = sampleWorld(d, seat, rng);
            for (int i = 0; i < legal.size(); i++) {
                Deal x = w.copy();
                x.play(legal.get(i));
                rollout(g, x);
                score[i] += g.evalDeal(x, seat);
            }
        }
        int best = 0;
        for (int i = 1; i < score.length; i++) if (score[i] > score[best]) best = i;
        return legal.get(best);
    }

    /**
     * Average value (game.evalDeal) for the seat if the deal were played in the given mode,
     * starting with `leader`. Unknown hands are sampled.
     */
    public static double estimate(TrickGame g, Deal base, int seat, Mode mode, int leader, int samples, Random rng) {
        double sum = 0;
        for (int k = 0; k < samples; k++) {
            Deal w = sampleWorld(base, seat, rng);
            w.mode = mode.copy();
            w.start(leader, w.hands[seat].size());
            rollout(g, w);
            sum += g.evalDeal(w, seat);
        }
        return sum / samples;
    }

    public static int samplesFor(int level) { return level == 0 ? 4 : level == 1 ? 12 : 30; }
}
