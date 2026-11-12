package app.jass.core;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Oh Shit! for 4 players, everybody alone. Nine deals with 9, 8, ... 1 cards each; the trump of every
 * deal (a suit, Obenabe or Undenufe) is drawn in advance, never the same twice in a row. Everybody
 * predicts his tricks; the dealer (last) may not make the sum equal the number of tricks.
 * An exact prediction scores the tricks (plus 10 bonus points).
 */
public final class OhShit extends TrickGame {
    static final int ROUNDS = 9;
    final String[] plan = new String[ROUNDS];
    final int[] bids;
    int cardsPer;

    OhShit(Config cfg, Random rng) {
        super(cfg, rng);
        totals = new long[n];
        bids = new int[n];
        String[] opts = {"trump0", "trump1", "trump2", "trump3", "obe", "une"};
        for (int i = 0; i < ROUNDS; i++) {
            String k;
            do { k = opts[rng.nextInt(opts.length)]; } while (i > 0 && k.equals(plan[i - 1]));
            plan[i] = k;
        }
        dealer = rng.nextInt(n);
        startRound();
    }

    @Override public int teams() { return n; }
    @Override public int team(int seat) { return seat; }

    private void startRound() {
        round++;
        dealer = (dealer + 1) % n;
        newDeal();
        cardsPer = 10 - round;
        List<Integer> deck = Cards.deck(1, rng);
        dealOut(deck, cardsPer);
        deal.mode = Mode.parse(plan[round - 1]);
        java.util.Arrays.fill(bids, -1);
        step = "bid";
        actor = (dealer + 1) % n;
        event("mode", "mode", plan[round - 1]);
    }

    int forbidden(int seat) {
        if (seat != dealer) return -1;
        int sum = 0;
        for (int s = 0; s < n; s++) if (s != seat && bids[s] >= 0) sum += bids[s];
        int f = cardsPer - sum;
        return f >= 0 ? f : -1;
    }

    @Override
    protected String actOther(int seat, String action, Map<String, String> p) {
        if (!"bid".equals(action)) return "unknown";
        if (!"bid".equals(step)) return "bad_step";
        if (seat != actor) return "not_your_turn";
        int v = parse(p, "value", -1);
        if (v < 0 || v > cardsPer) return "bad_value";
        if (v == forbidden(seat)) return "forbidden_bid";
        bid(seat, v);
        return null;
    }

    private void bid(int seat, int v) {
        bids[seat] = v;
        event("bid", "seat", seat, "value", v);
        if (seat == dealer) beginPlay(deal.mode, (dealer + 1) % n, cardsPer);
        else actor = (actor + 1) % n;
    }

    @Override
    protected void onDealDone() {
        int[] got = new int[n];
        for (int s = 0; s < n; s++) {
            got[s] = deal.tricks[s] == bids[s] ? bids[s] + (cfg.bonus ? 10 : 0) : 0;
            totals[s] += got[s];
        }
        Map<String, Object> r = newResult();
        r.put("mode", deal.mode.key());
        row(r, "r_bid", list(bids), null);
        row(r, "r_tricks", list(deal.tricks), null);
        row(r, "r_round", list(got), "pt");
        row(r, "r_total", list(totals), "tot");
        r.put("rounds", ROUNDS);
        result = r;
        if (round >= ROUNDS) {
            List<Integer> w = new ArrayList<>();
            long best = Long.MIN_VALUE;
            for (int s = 0; s < n; s++) best = Math.max(best, totals[s]);
            for (int s = 0; s < n; s++) if (totals[s] == best) w.add(s);
            finishGame(w);
        } else {
            step = ROUND_END;
            actor = -1;
        }
    }

    @Override
    public void nextRound() { if (ROUND_END.equals(step)) startRound(); }

    @Override
    public double evalDeal(Deal d, int seat) {
        int diff = Math.abs(d.tricks[seat] - bids[seat]);
        return diff == 0 ? 10 + bids[seat] : -diff;
    }

    @Override
    public int desire(Deal d, int seat) {
        if (bids[seat] < 0) return 1;
        return d.tricks[seat] < bids[seat] ? 1 : -1;
    }

    @Override
    protected void botOther(int seat, int level) {
        if (!"bid".equals(step)) return;
        int[] save = bids.clone();
        for (int s = 0; s < n; s++) bids[s] = 99;
        double sum = 0;
        int samples = Bot.samplesFor(level) + 6;
        for (int k = 0; k < samples; k++) {
            Deal w = Bot.sampleWorld(deal, seat, rng);
            w.start((dealer + 1) % n, cardsPer);
            Bot.rollout(this, w);
            sum += w.tricks[seat];
        }
        System.arraycopy(save, 0, bids, 0, n);
        double e = sum / samples;
        if (level == 0) e += rng.nextGaussian() * 0.8;
        int v = (int) Math.round(e * 0.9);
        v = Math.max(0, Math.min(cardsPer, v));
        int f = forbidden(seat);
        if (v == f) {
            int down = v - 1, up = v + 1;
            v = up > cardsPer ? down : down < 0 ? up : (e < v ? down : up);
        }
        bid(seat, v);
    }

    @Override protected boolean pointsVisible(int seat, List<Integer> mine) { return false; }

    @Override
    protected void fill(Map<String, Object> gm, List<Integer> mine) {
        super.fill(gm, mine);
        if (deal.mode != null && !PLAY.equals(step)) gm.put("mode", modeMap(deal.mode));
        gm.put("bids", bids);
        gm.put("rounds", ROUNDS);
        gm.put("cardsPer", cardsPer);
        gm.put("plan", plan);
        if ("bid".equals(step) && mine.contains(actor)) {
            Map<String, Object> pr = new LinkedHashMap<>();
            pr.put("type", "bid");
            pr.put("max", cardsPer);
            pr.put("forbidden", forbidden(actor));
            gm.put("prompt", pr);
        }
    }
}
