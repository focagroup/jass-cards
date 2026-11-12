package app.jass.core;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Molotow for 3 to 6 players, everybody alone; the goal is to take as few points as possible.
 * The deal starts without trump (like Obenabe); the first player who cannot follow suit makes the
 * suit of the card he plays trump. Undertrumping is allowed. Weis and Stöck from the hand count as
 * minus points; a Weis that comes together in a trick (Tischweis) counts for the trick winner.
 * The last deal counts double.
 */
public final class Molotow extends TrickGame {
    int[] tischweis;
    int per;

    Molotow(Config cfg, Random rng) {
        super(cfg, rng);
        totals = new long[n];
        dealer = rng.nextInt(n);
        weisOn = true;
        stoeckOn = false;
        startRound();
    }

    @Override public int teams() { return n; }
    @Override public int team(int seat) { return seat; }

    private void startRound() {
        round++;
        dealer = (dealer + 1) % n;
        newDeal();
        List<Integer> deck = Cards.deck(1, rng);
        if (n == 5) deck.remove(Integer.valueOf(Cards.id(0, Cards.R6))); // 35 cards: Schellen 6 out
        per = deck.size() / n;
        dealOut(deck, per);
        tischweis = new int[n];
        deal.molotow = true;
        deal.undertrumpAlways = true;
        beginPlay(new Mode(Mode.MOLOTOW, -1), (dealer + 1) % n, per);
    }

    @Override protected String actOther(int seat, String action, Map<String, String> p) { return "unknown"; }

    /** Everybody keeps his own Weis (as minus points); no comparison. */
    @Override
    protected void resolveWeis() {
        Map<String, Object> show = new LinkedHashMap<>();
        List<Object> per = new ArrayList<>();
        for (int s = 0; s < n; s++) {
            List<Object> items = new ArrayList<>();
            for (Weis.Item it : declared[s]) items.add(it.toMap());
            per.add(items);
        }
        show.put("seats", per);
        show.put("best", -1);
        show.put("all", true);
        weisShow = show;
    }

    @Override
    protected void onTrick() {
        List<Integer> cards = new ArrayList<>();
        for (int c : deal.lastTrickCards) cards.add(c);
        int v = Weis.sum(Weis.find(cards));
        if (v > 0) {
            tischweis[deal.lastWinner] += v;
            event("tischweis", "seat", deal.lastWinner, "pts", v);
        }
    }

    int[] stoeckMinus() {
        int[] st = new int[n];
        int t = deal.mode.suit;
        if (t < 0) return st;
        int o = Cards.id(t, Cards.OBER), k = Cards.id(t, Cards.KOENIG);
        for (int s = 0; s < n; s++) if (playedBy(s, o) && playedBy(s, k)) st[s] = -20;
        return st;
    }

    private final List<int[]> plays = new ArrayList<>();

    @Override
    protected String playCard(int seat, int card, String weisSel) {
        String e = super.playCard(seat, card, weisSel);
        if (e == null) plays.add(new int[]{seat, card});
        return e;
    }

    private boolean playedBy(int seat, int card) {
        for (int[] p : plays) if (p[0] == seat && p[1] == card) return true;
        return false;
    }

    @Override
    protected void onDealDone() {
        int[] pts = deal.recount();
        int[] weis = new int[n];
        for (int s = 0; s < n; s++) weis[s] = -Weis.sum(declared[s]);
        int[] st = stoeckMinus();
        boolean last = round >= cfg.rounds;
        int f = last ? 2 : 1;
        int[] sum = new int[n];
        for (int s = 0; s < n; s++) {
            sum[s] = (pts[s] + tischweis[s] + weis[s] + st[s]) * f;
            totals[s] += sum[s];
        }
        Map<String, Object> r = newResult();
        r.put("mode", deal.mode.key());
        row(r, "r_cards", list(pts), null);
        row(r, "r_tischweis", list(tischweis), null);
        row(r, "r_weisMinus", list(weis), null);
        row(r, "r_stoeckMinus", list(st), null);
        if (last) r.put("double", true);
        row(r, "r_round", list(sum), "pt");
        row(r, "r_total", list(totals), "tot");
        r.put("rounds", cfg.rounds);
        r.put("lowWins", true);
        result = r;
        plays.clear();
        if (last) {
            List<Integer> w = new ArrayList<>();
            long best = Long.MAX_VALUE;
            for (int s = 0; s < n; s++) best = Math.min(best, totals[s]);
            for (int s = 0; s < n; s++) if (totals[s] == best) w.add(s);
            finishGame(w);
        } else {
            step = ROUND_END;
            actor = -1;
        }
    }

    @Override
    public void nextRound() { if (ROUND_END.equals(step)) startRound(); }

    @Override public double evalDeal(Deal d, int seat) { return -d.recount()[seat]; }
    @Override public int desire(Deal d, int seat) { return -1; }
    @Override protected void botOther(int seat, int level) {}

    @Override
    protected void fill(Map<String, Object> gm, List<Integer> mine) {
        super.fill(gm, mine);
        gm.put("rounds", cfg.rounds);
        gm.put("tischweis", tischweis);
        gm.put("lastDouble", round >= cfg.rounds);
    }
}
