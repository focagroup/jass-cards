package app.jass.core;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Differenzler for 3 or 4 players, everybody alone. Trump is the dealer's last card (Bodentrumpf).
 * Everybody announces the card points they expect; the difference is written as penalty points.
 * An exact hit takes off 10 points. Fewest points after the agreed number of deals wins.
 */
public final class Differenzler extends TrickGame {
    final int[] ann;
    int announced;
    int[] lastPenalty;

    Differenzler(Config cfg, Random rng) {
        super(cfg, rng);
        totals = new long[n];
        ann = new int[n];
        dealer = rng.nextInt(n);
        startRound();
    }

    @Override public int teams() { return n; }
    @Override public int team(int seat) { return seat; }

    private void startRound() {
        round++;
        dealer = (dealer + 1) % n;
        newDeal();
        List<Integer> deck = Cards.deck(1, rng);
        int per = 36 / n;
        dealOut(deck, per);
        int bottom = deck.get(per * n - 1);
        shownCard = bottom;
        deal.mode = Mode.trump(Cards.suit(bottom));
        deal.undertrumpWhenVoid = true;
        java.util.Arrays.fill(ann, -1);
        announced = 0;
        step = "announce";
        actor = (dealer + 1) % n;
        event("bodentrumpf", "card", bottom);
    }

    @Override
    protected String actOther(int seat, String action, Map<String, String> p) {
        if (!"announce".equals(action)) return "unknown";
        if (!"announce".equals(step)) return "bad_step";
        if (seat != actor) return "not_your_turn";
        int v = parse(p, "value", -1);
        if (v < 0 || v > 157) return "bad_value";
        announce(seat, v);
        return null;
    }

    private void announce(int seat, int v) {
        ann[seat] = v;
        announced++;
        event("announce", "seat", seat, "value", cfg.hidden ? -1 : v);
        if (announced == n) beginPlay(deal.mode, (dealer + 1) % n, 36 / n);
        else actor = (actor + 1) % n;
    }

    @Override
    protected void onDealDone() {
        lastPenalty = new int[n];
        int[] got = new int[n];
        for (int s = 0; s < n; s++) {
            got[s] = deal.points[s];
            int diff = Math.abs(ann[s] - got[s]);
            int pen = diff;
            if (diff == 0) pen = (ann[s] == 0 && deal.tricks[s] == 0) ? 0 : -10;
            lastPenalty[s] = pen;
            totals[s] += pen;
        }
        Map<String, Object> r = newResult();
        row(r, "r_announced", list(ann), null);
        row(r, "r_cards", list(got), null);
        row(r, "r_diff", list(lastPenalty), "pt");
        row(r, "r_total", list(totals), "tot");
        r.put("rounds", cfg.rounds);
        r.put("lowWins", true);
        result = r;
        if (round >= cfg.rounds) {
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

    // ------------------------------------------------------------------ bots

    @Override
    public double evalDeal(Deal d, int seat) {
        return -Math.abs(ann[seat] - d.points[seat]);
    }

    @Override
    public int desire(Deal d, int seat) {
        if (ann[seat] < 0) return 1;
        int left = ann[seat] - d.points[seat];
        return left > 4 ? 1 : -1;
    }

    /** Expected card points when everybody simply plays for points. */
    private double expectPoints(int seat, int samples) {
        int[] save = ann.clone();
        for (int s = 0; s < n; s++) ann[s] = 157; // everybody wants points during the estimate
        double sum = 0;
        for (int k = 0; k < samples; k++) {
            Deal w = Bot.sampleWorld(deal, seat, rng);
            w.start((dealer + 1) % n, 36 / n);
            Bot.rollout(this, w);
            sum += w.points[seat];
        }
        System.arraycopy(save, 0, ann, 0, n);
        return sum / samples;
    }

    @Override
    protected void botOther(int seat, int level) {
        if (!"announce".equals(step)) return;
        double e = expectPoints(seat, Bot.samplesFor(level) + 6);
        if (level == 0) e += rng.nextGaussian() * 15;
        int v = (int) Math.round(e / 5.0) * 5;
        announce(seat, Math.max(0, Math.min(157, v)));
    }

    // ------------------------------------------------------------------ view

    @Override
    protected boolean pointsVisible(int seat, List<Integer> mine) { return mine.contains(seat); }

    @Override
    protected void fill(Map<String, Object> gm, List<Integer> mine) {
        super.fill(gm, mine);
        List<Object> a = new ArrayList<>();
        boolean reveal = !cfg.hidden || ROUND_END.equals(step) || OVER.equals(step);
        for (int s = 0; s < n; s++) a.add(ann[s] < 0 ? null : (reveal || mine.contains(s)) ? ann[s] : -1);
        gm.put("announced", a);
        gm.put("hidden", cfg.hidden);
        gm.put("rounds", cfg.rounds);
        if ("announce".equals(step) && mine.contains(actor)) {
            Map<String, Object> pr = new LinkedHashMap<>();
            pr.put("type", "announce");
            pr.put("max", 157);
            gm.put("prompt", pr);
        }
    }
}
