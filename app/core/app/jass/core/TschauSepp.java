package app.jass.core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Tschau Sepp (Swiss Mau-Mau) for 2 to 8 players; from 5 players with two decks.
 * Match the top card in suit or rank. 7: next player draws 2 (stackable with 7s),
 * 8: next player is skipped, Under: wish a suit (not on another Under), As: must be covered (play again),
 * optional 10: reverse direction. Say "Tschau" when playing your second-to-last card and "Sepp" with
 * the last one, or draw 4 penalty cards. Losers count the cards left in their hand.
 */
public final class TschauSepp extends Match {
    final List<Integer>[] hands;
    final List<Integer> stock = new ArrayList<>(), pile = new ArrayList<>();
    int turn, dir = 1, wish = -1, pending, drawn = -1;
    boolean mustCover;
    int roundWinner = -1;
    int moveSeq;
    Map<String, Object> lastMove;
    final int decks;

    @SuppressWarnings("unchecked")
    TschauSepp(Config cfg, Random rng) {
        super(cfg, rng);
        decks = n >= 5 ? 2 : 1;
        hands = new List[n];
        for (int i = 0; i < n; i++) hands[i] = new ArrayList<>();
        totals = new long[n];
        dealer = rng.nextInt(n);
        startRound();
    }

    @Override public int teams() { return n; }
    @Override public int team(int seat) { return seat; }

    private void startRound() {
        round++;
        dealer = (dealer + 1) % n;
        for (List<Integer> h : hands) h.clear();
        stock.clear();
        pile.clear();
        stock.addAll(Cards.deck(decks, rng));
        for (int k = 0; k < 5; k++) for (int i = 0; i < n; i++) hands[(dealer + 1 + i) % n].add(stock.remove(stock.size() - 1));
        pile.add(stock.remove(stock.size() - 1));
        int top = top();
        wish = Cards.rank(top) == Cards.UNDER ? Cards.suit(top) : -1;
        dir = 1;
        pending = 0;
        drawn = -1;
        mustCover = false;
        roundWinner = -1;
        turn = (dealer + 1) % n;
        actor = turn;
        step = PLAY;
        lastMove = null;
        result = null;
    }

    int top() { return pile.get(pile.size() - 1); }

    public static int value(int c) {
        int r = Cards.rank(c);
        if (r <= Cards.R10) return r + 6;
        if (r == Cards.UNDER) return 20;
        if (r == Cards.ASS) return 11;
        return 10;
    }

    boolean playable(int c) {
        int t = top();
        if (Cards.rank(c) == Cards.UNDER) return Cards.rank(t) != Cards.UNDER;
        if (wish >= 0) return Cards.suit(c) == wish;
        return Cards.suit(c) == Cards.suit(t) || Cards.rank(c) == Cards.rank(t);
    }

    List<Integer> legal(int seat) {
        List<Integer> out = new ArrayList<>();
        if (seat != turn || !PLAY.equals(step)) return out;
        if (pending > 0) {
            for (int c : hands[seat]) if (Cards.rank(c) == Cards.R7) out.add(c);
            return out;
        }
        if (drawn >= 0) {
            if (playable(drawn)) out.add(drawn);
            return out;
        }
        for (int c : hands[seat]) if (playable(c)) out.add(c);
        return out;
    }

    private int drawOne() {
        if (stock.isEmpty()) {
            int t = pile.remove(pile.size() - 1);
            stock.addAll(pile);
            pile.clear();
            pile.add(t);
            Collections.shuffle(stock, rng);
        }
        return stock.isEmpty() ? -1 : stock.remove(stock.size() - 1);
    }

    private int drawCards(int seat, int k) {
        int got = 0;
        for (int i = 0; i < k; i++) {
            int c = drawOne();
            if (c < 0) break;
            hands[seat].add(c);
            got++;
        }
        return got;
    }

    private void advance(int steps) {
        mustCover = false;
        drawn = -1;
        turn = ((turn + dir * steps) % n + n) % n;
        actor = turn;
    }

    private void move(int seat, String type, int card, int count) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("seq", ++moveSeq);
        m.put("seat", seat);
        m.put("type", type);
        m.put("card", card);
        m.put("count", count);
        lastMove = m;
    }

    @Override
    public String act(int seat, String action, Map<String, String> p) {
        if (!PLAY.equals(step)) return "bad_step";
        if (seat != turn) return "not_your_turn";
        switch (action) {
            case "play": {
                int c = parse(p, "card", -1);
                if (!hands[seat].contains(c) || !legal(seat).contains(c)) return "illegal_card";
                play(seat, c, "1".equals(p.get("tschau")), "1".equals(p.get("sepp")), parse(p, "wish", -1));
                return null;
            }
            case "draw":
                if (drawn >= 0) return "already_drawn";
                draw(seat);
                return null;
            case "pass":
                if (drawn < 0) return "cannot_pass";
                event("pass", "seat", seat);
                advance(1);
                return null;
            default:
                return "unknown";
        }
    }

    private void play(int seat, int c, boolean tschau, boolean sepp, int wishSuit) {
        int before = hands[seat].size();
        hands[seat].remove(Integer.valueOf(c));
        pile.add(c);
        drawn = -1;
        move(seat, "play", c, 0);
        int r = Cards.rank(c);
        if (before == 2) {
            if (tschau) event("tschau", "seat", seat);
            else { drawCards(seat, 4); event("forgot", "seat", seat, "call", "tschau"); }
        } else if (before == 1) {
            if (sepp) event("sepp", "seat", seat);
            else { drawCards(seat, 4); event("forgot", "seat", seat, "call", "sepp"); }
        }
        wish = -1;
        if (r == Cards.UNDER) {
            wish = wishSuit >= 0 && wishSuit < 4 ? wishSuit : Cards.suit(c);
            event("wish", "seat", seat, "suit", wish);
        }
        if (r == Cards.R7) pending += 2;
        if (r == Cards.ASS) {
            mustCover = true;
            actor = turn;
            return;
        }
        if (hands[seat].isEmpty()) { endRound(seat); return; }
        int steps = 1;
        if (r == Cards.R8) { steps = 2; event("skip", "seat", (seat + dir + n) % n); }
        if (cfg.reverse10 && r == Cards.R10 && n > 2) { dir = -dir; event("reverse"); }
        advance(steps);
    }

    private void draw(int seat) {
        if (pending > 0) {
            int k = drawCards(seat, pending);
            event("drawPenalty", "seat", seat, "count", k);
            move(seat, "draw", -1, k);
            pending = 0;
            advance(1);
            return;
        }
        int c = drawOne();
        if (c < 0) { move(seat, "draw", -1, 0); advance(1); return; }
        hands[seat].add(c);
        move(seat, "draw", -1, 1);
        if (playable(c)) drawn = c;
        else advance(1);
    }

    private void endRound(int w) {
        roundWinner = w;
        int[] pen = new int[n];
        int[] left = new int[n];
        for (int s = 0; s < n; s++) {
            for (int c : hands[s]) pen[s] += value(c);
            left[s] = hands[s].size();
            totals[s] += pen[s];
        }
        event("out", "seat", w);
        Map<String, Object> r = newResult();
        row(r, "r_cardsLeft", list(left), null);
        row(r, "r_penalty", list(pen), "pt");
        row(r, "r_total", list(totals), "tot");
        r.put("roundWinner", w);
        r.put("limit", cfg.limit);
        r.put("lowWins", true);
        result = r;
        long max = 0, min = Long.MAX_VALUE;
        for (long t : totals) { max = Math.max(max, t); min = Math.min(min, t); }
        if (max >= cfg.limit) {
            List<Integer> win = new ArrayList<>();
            for (int s = 0; s < n; s++) if (totals[s] == min) win.add(s);
            finishGame(win);
        } else {
            step = ROUND_END;
            actor = -1;
        }
    }

    @Override
    public void nextRound() { if (ROUND_END.equals(step)) startRound(); }

    // ------------------------------------------------------------------ bot

    @Override
    public void bot(int seat, int level) {
        if (!PLAY.equals(step) || seat != turn) return;
        List<Integer> legal = legal(seat);
        if (legal.isEmpty()) {
            Map<String, String> p = new LinkedHashMap<>();
            act(seat, drawn >= 0 ? "pass" : "draw", p);
            return;
        }
        int next = ((seat + dir) % n + n) % n;
        int nextCount = hands[next].size();
        int best = legal.get(0);
        double bestV = -1e9;
        for (int c : legal) {
            int r = Cards.rank(c);
            double v = value(c) * 0.3;
            if (r == Cards.UNDER) v -= hands[seat].size() > 1 ? 40 : -5;
            if (r == Cards.R7) v += nextCount <= 2 ? 30 : 4;
            if (r == Cards.R8) v += nextCount <= 2 ? 25 : 3;
            if (r == Cards.ASS) {
                boolean follow = false;
                for (int x : hands[seat]) if (x != c && (Cards.suit(x) == Cards.suit(c) || Cards.rank(x) == Cards.ASS || Cards.rank(x) == Cards.UNDER)) follow = true;
                v += follow ? 8 : -25;
            }
            int same = 0;
            for (int x : hands[seat]) if (x != c && Cards.suit(x) == Cards.suit(c)) same++;
            v += same * 2;
            if (level == 0) v += rng.nextDouble() * 20;
            if (v > bestV) { bestV = v; best = c; }
        }
        int[] cnt = new int[4];
        for (int x : hands[seat]) if (x != best && Cards.rank(x) != Cards.UNDER) cnt[Cards.suit(x)]++;
        int ws = Cards.suit(best);
        for (int s = 0; s < 4; s++) if (cnt[s] > cnt[ws]) ws = s;
        int forget = level == 0 ? 25 : level == 1 ? 6 : 0;
        boolean call = rng.nextInt(100) >= forget;
        int size = hands[seat].size();
        play(seat, best, size == 2 && call, size == 1 && call, ws);
    }

    // ------------------------------------------------------------------ view

    @Override
    protected void fill(Map<String, Object> gm, List<Integer> mine) {
        gm.put("kind", "tschau");
        Map<String, Object> hs = new LinkedHashMap<>();
        for (int s : mine) hs.put(String.valueOf(s), Cards.toArray(hands[s]));
        gm.put("hands", hs);
        List<Object> counts = new ArrayList<>();
        for (List<Integer> h : hands) counts.add(h.size());
        gm.put("handCounts", counts);
        gm.put("top", pile.isEmpty() ? -1 : top());
        gm.put("pileCount", pile.size());
        gm.put("stock", stock.size());
        gm.put("wish", wish);
        gm.put("pending", pending);
        gm.put("dir", dir);
        gm.put("mustCover", mustCover);
        gm.put("turn", turn);
        gm.put("limit", cfg.limit);
        gm.put("roundWinner", roundWinner);
        if (lastMove != null) gm.put("lastMove", lastMove);
        if (PLAY.equals(step) && mine.contains(turn)) {
            gm.put("legal", Cards.toArray(legal(turn)));
            gm.put("drawn", drawn);
            gm.put("canDraw", drawn < 0);
            gm.put("canPass", drawn >= 0);
        }
    }
}
