package app.jass.core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Arschlöchle for 3 to 6 players (JassWiki rules). Only ranks count: 6 lowest, As highest; optionally
 * the Rosen-6 is a Joker that beats everything. Lead a single card or several of one rank; the others
 * must beat with the same number of a higher rank (or sit out). The first player out is König, the last
 * one Arschloch. From the second round the Arschloch gives the König his two best cards and gets two
 * back (Vize-Arschloch / Vize-König: one card) and leads. Rank points after a fixed number of rounds.
 */
public final class Arschloechle extends Match {
    public static final int JOKER = Cards.id(1, Cards.R6);
    static final String K = "koenig", VK = "vizekoenig", B = "buerger", VA = "vizearsch", A = "arschloch";

    final List<Integer>[] hands;
    final List<Integer> table = new ArrayList<>();
    int tableCount, tableStrength = -1, lastPlayer = -1, turn;
    final boolean[] passed, out;
    final List<Integer> finished = new ArrayList<>();
    String[] titles, lastTitles;
    /** Exchange still to do: [giver of chosen cards, receiver, count]. */
    final List<int[]> exchanges = new ArrayList<>();
    int moveSeq;
    Map<String, Object> lastMove;

    @SuppressWarnings("unchecked")
    Arschloechle(Config cfg, Random rng) {
        super(cfg, rng);
        hands = new List[n];
        for (int i = 0; i < n; i++) hands[i] = new ArrayList<>();
        passed = new boolean[n];
        out = new boolean[n];
        totals = new long[n];
        dealer = rng.nextInt(n);
        startRound();
    }

    @Override public int teams() { return n; }
    @Override public int team(int seat) { return seat; }

    static String[] titleOrder(int n) {
        switch (n) {
            case 3: return new String[]{K, B, A};
            case 4: return new String[]{K, VK, VA, A};
            case 5: return new String[]{K, VK, B, VA, A};
            default: return new String[]{K, VK, B, B, VA, A};
        }
    }

    static int titlePoints(String t) {
        switch (t) {
            case K: return 3;
            case VK: return 2;
            case B: return 1;
            case VA: return 0;
            default: return -1;
        }
    }

    int seatWith(String title) {
        if (lastTitles == null) return -1;
        for (int s = 0; s < n; s++) if (title.equals(lastTitles[s])) return s;
        return -1;
    }

    int strength(int c) { return cfg.joker && c == JOKER ? 100 : Cards.rank(c); }

    private void startRound() {
        round++;
        for (List<Integer> h : hands) h.clear();
        table.clear();
        tableCount = 0;
        tableStrength = -1;
        lastPlayer = -1;
        java.util.Arrays.fill(passed, false);
        java.util.Arrays.fill(out, false);
        finished.clear();
        titles = new String[n];
        exchanges.clear();
        lastMove = null;
        int arsch = seatWith(A);
        dealer = arsch >= 0 ? arsch : (dealer + 1) % n;
        List<Integer> deck = Cards.deck(1, rng);
        int per = 36 / n;
        for (int j = 0; j < per * n; j++) hands[(dealer + 1 + j) % n].add(deck.get(j));
        for (int j = per * n; j < 36; j++) hands[dealer].add(deck.get(j)); // leftover: Arschloch (round 1: dealer)
        turn = arsch >= 0 ? arsch : (dealer + 1) % n;
        if (arsch >= 0) {
            int king = seatWith(K);
            give(arsch, king, best(arsch, 2));
            exchanges.add(new int[]{king, arsch, 2});
            int va = seatWith(VA), vk = seatWith(VK);
            if (va >= 0 && vk >= 0) {
                give(va, vk, best(va, 1));
                exchanges.add(new int[]{vk, va, 1});
            }
        }
        nextStep();
    }

    private List<Integer> best(int seat, int k) {
        List<Integer> h = new ArrayList<>(hands[seat]);
        Collections.sort(h, new Comparator<Integer>() {
            @Override public int compare(Integer a, Integer b) { return strength(b) - strength(a); }
        });
        return new ArrayList<>(h.subList(0, Math.min(k, h.size())));
    }

    private void give(int from, int to, List<Integer> cards) {
        hands[from].removeAll(cards);
        hands[to].addAll(cards);
        event("give", "seat", from, "to", to, "count", cards.size());
    }

    private void nextStep() {
        if (!exchanges.isEmpty()) {
            step = "exchange";
            actor = exchanges.get(0)[0];
        } else {
            step = PLAY;
            actor = turn;
        }
    }

    // ------------------------------------------------------------------ rules

    /** Groups (rank -> cards) of a hand, without the Joker. */
    private Map<Integer, List<Integer>> groups(int seat) {
        Map<Integer, List<Integer>> g = new LinkedHashMap<>();
        for (int r = 0; r < 9; r++) g.put(r, new ArrayList<Integer>());
        for (int c : hands[seat]) if (strength(c) < 100) g.get(Cards.rank(c)).add(c);
        return g;
    }

    boolean hasJoker(int seat) { return cfg.joker && hands[seat].contains(JOKER); }

    boolean canBeat(int seat) {
        if (tableCount == 0) return true;
        if (tableStrength >= 100) return false;
        if (hasJoker(seat)) return true;
        for (Map.Entry<Integer, List<Integer>> e : groups(seat).entrySet())
            if (e.getKey() > tableStrength && e.getValue().size() >= tableCount) return true;
        return false;
    }

    String check(int seat, List<Integer> cs) {
        if (cs.isEmpty()) return "bad_cards";
        if (new java.util.HashSet<>(cs).size() != cs.size() || !hands[seat].containsAll(cs)) return "bad_cards";
        boolean joker = cfg.joker && cs.contains(JOKER);
        if (joker && cs.size() != 1) return "bad_cards";
        int r = Cards.rank(cs.get(0));
        if (!joker) for (int c : cs) if (Cards.rank(c) != r || strength(c) >= 100) return "bad_cards";
        if (tableCount == 0) return null;
        if (joker) return tableStrength < 100 ? null : "too_low";
        if (cs.size() != tableCount) return "bad_count";
        return r > tableStrength ? null : "too_low";
    }

    @Override
    public String act(int seat, String action, Map<String, String> p) {
        if (seat != actor) return "not_your_turn";
        switch (action) {
            case "play": {
                if (!PLAY.equals(step)) return "bad_step";
                List<Integer> cs = Cards.parseList(p.get("cards"));
                String e = check(seat, cs);
                if (e != null) return e;
                play(seat, cs);
                return null;
            }
            case "pass": {
                if (!PLAY.equals(step)) return "bad_step";
                if (tableCount == 0) return "cannot_pass";
                if (!cfg.freePass && canBeat(seat)) return "must_beat";
                pass(seat, false);
                advance();
                return null;
            }
            case "give": {
                if (!"exchange".equals(step)) return "bad_step";
                int[] ex = exchanges.get(0);
                List<Integer> cs = Cards.parseList(p.get("cards"));
                if (cs.size() != ex[2] || !hands[seat].containsAll(cs) || new java.util.HashSet<>(cs).size() != cs.size()) return "bad_cards";
                doGiveBack(cs);
                return null;
            }
            default:
                return "unknown";
        }
    }

    private void doGiveBack(List<Integer> cs) {
        int[] ex = exchanges.remove(0);
        give(ex[0], ex[1], cs);
        nextStep();
    }

    private void play(int seat, List<Integer> cs) {
        hands[seat].removeAll(cs);
        table.clear();
        table.addAll(cs);
        tableCount = cs.size();
        tableStrength = strength(cs.get(0));
        lastPlayer = seat;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("seq", ++moveSeq);
        m.put("seat", seat);
        m.put("type", "play");
        m.put("cards", Cards.toArray(cs));
        lastMove = m;
        if (hands[seat].isEmpty()) finish(seat);
        if (active() <= 1) { endRound(); return; }
        advance();
    }

    private void pass(int seat, boolean auto) {
        passed[seat] = true;
        event("pass", "seat", seat, "auto", auto);
    }

    private void finish(int seat) {
        out[seat] = true;
        finished.add(seat);
        titles[seat] = titleOrder(n)[finished.size() - 1];
        event("out", "seat", seat, "title", titles[seat]);
    }

    int active() {
        int k = 0;
        for (int s = 0; s < n; s++) if (!out[s]) k++;
        return k;
    }

    /** Next player who still has to decide; auto-passes those who cannot beat; ends the trick if all passed. */
    private void advance() {
        int s = turn;
        for (int k = 0; k < n; k++) {
            s = (s + 1) % n;
            if (out[s]) continue;
            if (s == lastPlayer) break;
            if (passed[s]) continue;
            if (!canBeat(s)) { pass(s, true); continue; }
            turn = s;
            actor = s;
            return;
        }
        endTrick();
    }

    private void endTrick() {
        int lead = lastPlayer;
        while (out[lead]) lead = (lead + 1) % n;
        table.clear();
        tableCount = 0;
        tableStrength = -1;
        java.util.Arrays.fill(passed, false);
        lastPlayer = -1;
        turn = lead;
        actor = lead;
        event("trickEnd", "seat", lead);
    }

    private void endRound() {
        for (int s = 0; s < n; s++) if (!out[s]) finish(s);
        int[] pts = new int[n];
        int[] place = new int[n];
        List<Object> tl = new ArrayList<>();
        for (int s = 0; s < n; s++) {
            pts[s] = titlePoints(titles[s]);
            totals[s] += pts[s];
            place[s] = finished.indexOf(s) + 1;
            tl.add("t_" + titles[s]);
        }
        lastTitles = titles.clone();
        Map<String, Object> r = newResult();
        row(r, "r_title", tl, null);
        row(r, "r_points", list(pts), "pt");
        row(r, "r_total", list(totals), "tot");
        r.put("rounds", cfg.rounds);
        result = r;
        if (round >= cfg.rounds) {
            List<Integer> w = new ArrayList<>();
            long best = Long.MIN_VALUE;
            for (long t : totals) best = Math.max(best, t);
            for (int s = 0; s < n; s++) if (totals[s] == best) w.add(s);
            finishGame(w);
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
        if (seat != actor) return;
        if ("exchange".equals(step)) {
            int need = exchanges.get(0)[2];
            final Map<Integer, List<Integer>> g = groups(seat);
            List<Integer> h = new ArrayList<>(hands[seat]);
            Collections.sort(h, new Comparator<Integer>() {
                @Override public int compare(Integer a, Integer b) { return key(a) - key(b); }
                int key(int c) {
                    if (strength(c) >= 100) return 1000;
                    int size = g.get(Cards.rank(c)).size();
                    return (size > 1 ? 20 : 0) + Cards.rank(c);
                }
            });
            if (level == 0) Collections.shuffle(h.subList(0, Math.min(h.size(), need + 2)), rng);
            doGiveBack(new ArrayList<>(h.subList(0, need)));
            return;
        }
        Map<Integer, List<Integer>> g = groups(seat);
        boolean joker = hasJoker(seat);
        int left = hands[seat].size();
        if (tableCount == 0) {
            int groupsLeft = 0;
            for (List<Integer> l : g.values()) if (!l.isEmpty()) groupsLeft++;
            if (joker && (groupsLeft <= 1 || left == 1)) {
                // finish strongly: joker first when only one group would remain behind it
                play(seat, Collections.singletonList(JOKER));
                return;
            }
            for (int r = 0; r < 9; r++) {
                List<Integer> l = g.get(r);
                if (l.isEmpty()) continue;
                if (level == 0 && rng.nextInt(3) == 0 && l.size() > 1) { play(seat, l.subList(0, 1)); return; }
                play(seat, new ArrayList<>(l));
                return;
            }
            play(seat, Collections.singletonList(JOKER));
            return;
        }
        int exact = -1, broken = -1;
        for (int r = tableStrength + 1; r < 9 && tableStrength < 100; r++) {
            int size = g.get(r).size();
            if (size == tableCount && exact < 0) exact = r;
            if (size > tableCount && broken < 0) broken = r;
        }
        int pick = exact >= 0 ? exact : broken;
        if (exact >= 0 && broken >= 0 && broken < exact && exact >= 7) pick = broken;
        boolean mayPass = cfg.freePass;
        if (pick >= 0) {
            if (mayPass && level >= 1 && pick >= 7 && left > 4 && tableCount == 1 && rng.nextInt(3) > 0) { pass(seat, false); advance(); return; }
            play(seat, new ArrayList<>(g.get(pick).subList(0, tableCount)));
            return;
        }
        if (joker && (!mayPass || left <= 3 || tableCount >= 2)) {
            play(seat, Collections.singletonList(JOKER));
            return;
        }
        pass(seat, false);
        advance();
    }

    // ------------------------------------------------------------------ view

    @Override
    protected void fill(Map<String, Object> gm, List<Integer> mine) {
        gm.put("kind", "asch");
        Map<String, Object> hs = new LinkedHashMap<>();
        for (int s : mine) hs.put(String.valueOf(s), Cards.toArray(hands[s]));
        gm.put("hands", hs);
        List<Object> counts = new ArrayList<>();
        for (List<Integer> h : hands) counts.add(h.size());
        gm.put("handCounts", counts);
        gm.put("table", Cards.toArray(table));
        gm.put("tableOwner", lastPlayer);
        gm.put("tableCount", tableCount);
        gm.put("tableStrength", tableStrength);
        gm.put("passed", passed);
        List<Object> pl = new ArrayList<>();
        for (int s = 0; s < n; s++) pl.add(out[s] ? finished.indexOf(s) + 1 : 0);
        gm.put("places", pl);
        gm.put("titles", titles);
        gm.put("lastTitles", lastTitles);
        gm.put("joker", cfg.joker ? JOKER : -1);
        gm.put("rounds", cfg.rounds);
        if (lastMove != null) gm.put("lastMove", lastMove);
        if (mine.contains(actor)) {
            if (PLAY.equals(step)) {
                gm.put("canPass", tableCount > 0 && (cfg.freePass || !canBeat(actor)));
            } else if ("exchange".equals(step)) {
                Map<String, Object> pr = new LinkedHashMap<>();
                pr.put("type", "give");
                pr.put("count", exchanges.get(0)[2]);
                pr.put("to", exchanges.get(0)[1]);
                gm.put("prompt", pr);
            }
        }
    }
}
