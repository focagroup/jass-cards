package app.jass.core;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

/**
 * Klassisch (3-4 players, teams of two or everybody alone) and Schieber (4 players, two teams,
 * the trump may be pushed to the partner). Weis, Stöck, Matsch, multipliers and "Bedanken".
 */
public final class TeamJass extends TrickGame {
    static final int CARDS = 0, WEIS = 1, STOECK = 2, MATSCH = 3;

    final boolean teamPlay, schieber;
    final int nT;
    int chooser = -1;
    boolean pushed;
    int mult = 1;
    long[] live;
    int[][] parts;
    final int[] reachSeq, reachBatch;
    int creditSeq;
    boolean ended;

    TeamJass(Config cfg, Random rng) {
        super(cfg, rng);
        schieber = "schieber".equals(cfg.variant);
        teamPlay = cfg.teamPlay();
        nT = teamPlay ? 2 : n;
        totals = new long[nT];
        live = new long[nT];
        reachSeq = new int[nT];
        reachBatch = new int[nT];
        Arrays.fill(reachSeq, -1);
        weisOn = stoeckOn = true;
        dealer = rng.nextInt(n);
        startRound();
    }

    @Override public int teams() { return nT; }
    @Override public int team(int seat) { return teamPlay ? seat % 2 : seat; }

    private void startRound() {
        round++;
        dealer = (dealer + 1) % n;
        newDeal();
        List<Integer> deck = Cards.deck(1, rng);
        dealOut(deck, 36 / n);
        if (chooser < 0) {
            int r7 = Cards.id(1, Cards.R7);
            for (int s = 0; s < n; s++) if (deal.hands[s].contains(r7)) chooser = s;
        } else {
            chooser = (chooser + 1) % n;
        }
        pushed = false;
        parts = new int[nT][4];
        step = "trump";
        actor = chooser;
        event("chooser", "seat", chooser);
    }

    List<String> modeOptions() {
        List<String> o = new ArrayList<>(Arrays.asList("trump0", "trump1", "trump2", "trump3", "obe", "une"));
        if (schieber && cfg.slalom) { o.add("slalomObe"); o.add("slalomUne"); }
        if (schieber && cfg.tutti) o.add("tutti");
        return o;
    }

    boolean misereAllowed() { return schieber && cfg.misere; }

    static int multiplier(String preset, Mode m) {
        int[] suit;
        int obe, une;
        switch (preset) {
            case "double": suit = new int[]{2, 1, 2, 1}; obe = 3; une = 3; break;
            case "double4": suit = new int[]{2, 1, 2, 1}; obe = 3; une = 4; break;
            case "appenzell": suit = new int[]{2, 3, 4, 7}; obe = 5; une = 6; break;
            default: return 1;
        }
        switch (m.type) {
            case Mode.TRUMP: return suit[m.suit];
            case Mode.OBE: case Mode.SLALOM_OBE: case Mode.SLALOM_UNE: return obe;
            default: return une;
        }
    }

    @Override
    protected String actOther(int seat, String action, Map<String, String> p) {
        switch (action) {
            case "trump": {
                if (!"trump".equals(step)) return "bad_step";
                if (seat != actor) return "not_your_turn";
                Mode m = Mode.parse(p.get("mode"));
                if (m == null) return "bad_mode";
                String base = m.misere ? m.key().substring(0, m.key().length() - 2) : m.key();
                if (!modeOptions().contains(base)) return "bad_mode";
                if (m.misere && !misereAllowed()) return "bad_mode";
                chooseMode(seat, m);
                return null;
            }
            case "push": {
                if (!"trump".equals(step)) return "bad_step";
                if (seat != actor) return "not_your_turn";
                if (!schieber || pushed) return "cannot_push";
                pushed = true;
                actor = (chooser + 2) % 4;
                event("push", "seat", seat);
                return null;
            }
            case "thanks":
                return thanks(seat);
            default:
                return "unknown";
        }
    }

    private void chooseMode(int seat, Mode m) {
        mult = multiplier(cfg.mult, m);
        event("mode", "seat", seat, "mode", m.key(), "mult", mult);
        beginPlay(m, chooser, 36 / n);
    }

    // ------------------------------------------------------------------ scoring

    private void credit(int tm, int pts, int kind, int batch) {
        if (pts == 0 || ended) return;
        parts[tm][kind] += pts;
        live[tm] += pts;
        creditSeq++;
        if (live[tm] >= cfg.target && reachSeq[tm] < 0) {
            reachSeq[tm] = creditSeq;
            reachBatch[tm] = round * 100 + batch;
            if (!cfg.manualThanks) end(Collections.singletonList(tm), "reached");
        }
    }

    @Override protected void onStoeck(int seat) { credit(team(seat), 20 * mult, STOECK, deal.trickNo + 1); }
    @Override protected void onWeis(int tm, int pts) { credit(tm, pts * mult, WEIS, 1); }

    @Override
    protected void onTrick() {
        int tm = team(deal.lastWinner);
        int to = deal.mode.misere ? 1 - tm : tm;
        credit(to, deal.lastTrickPoints * mult, CARDS, deal.trickNo);
    }

    @Override
    protected void onDealDone() {
        if (ended) return;
        if (!deal.mode.misere) {
            for (int tm = 0; tm < nT; tm++) {
                int tr = 0;
                for (int s = 0; s < n; s++) if (team(s) == tm) tr += deal.tricks[s];
                if (tr == deal.totalTricks) { credit(tm, 100 * mult, MATSCH, deal.trickNo); event("matsch", "team", tm); }
            }
        }
        if (ended) return;
        totals = live.clone();
        result = buildResult(false);
        step = ROUND_END;
        actor = -1;
    }

    private String thanks(int seat) {
        if (over()) return "game_over";
        int tm = team(seat);
        if (reachSeq[tm] >= 0) {
            int win = tm;
            for (int u = 0; u < nT; u++)
                if (u != tm && reachSeq[u] >= 0 && reachBatch[u] == reachBatch[tm] && reachSeq[u] < reachSeq[win]) win = u;
            event("thanks", "seat", seat, "ok", true);
            end(Collections.singletonList(win), win == tm ? "thanks" : "order");
        } else {
            event("thanks", "seat", seat, "ok", false);
            int win;
            if (teamPlay) win = 1 - tm;
            else {
                win = -1;
                for (int u = 0; u < nT; u++) if (u != tm && (win < 0 || live[u] > live[win])) win = u;
            }
            end(Collections.singletonList(win), "early");
        }
        return null;
    }

    private void end(List<Integer> w, String why) {
        ended = true;
        totals = live.clone();
        result = buildResult(true);
        result.put("why", why);
        finishGame(w);
    }

    @Override
    public boolean botExtra(Set<Integer> bots) {
        if (!cfg.manualThanks || over()) return false;
        for (int b : bots) {
            if (b < n && reachSeq[team(b)] >= 0) { thanks(b); return true; }
        }
        return false;
    }

    private Map<String, Object> buildResult(boolean midGame) {
        Map<String, Object> r = newResult();
        r.put("mode", deal.mode == null ? null : deal.mode.key());
        r.put("mult", mult);
        int[][] col = new int[4][nT];
        int[] sum = new int[nT];
        for (int tm = 0; tm < nT; tm++) for (int k = 0; k < 4; k++) { col[k][tm] = parts[tm][k]; sum[tm] += parts[tm][k]; }
        row(r, "r_cards", list(col[CARDS]), null);
        row(r, "r_weis", list(col[WEIS]), null);
        row(r, "r_stoeck", list(col[STOECK]), null);
        row(r, "r_matsch", list(col[MATSCH]), null);
        row(r, "r_round", list(sum), "pt");
        row(r, "r_total", list(live), "tot");
        r.put("target", cfg.target);
        r.put("midGame", midGame);
        return r;
    }

    @Override
    public void nextRound() {
        if (ROUND_END.equals(step)) startRound();
    }

    // ------------------------------------------------------------------ bots

    @Override
    public double evalDeal(Deal d, int seat) {
        int my = team(seat);
        double own = 0, other = 0;
        int[] tr = new int[nT];
        for (int s = 0; s < n; s++) {
            if (team(s) == my) own += d.points[s]; else other += d.points[s];
            tr[team(s)] += d.tricks[s];
        }
        if (!teamPlay) other /= (n - 1);
        if (d.mode.misere) { double x = own; own = other; other = x; }
        else {
            if (tr[my] == d.totalTricks) own += 100;
            for (int u = 0; u < nT; u++) if (u != my && tr[u] == d.totalTricks) other += teamPlay ? 100 : 100.0 / (n - 1);
        }
        return own - other;
    }

    @Override
    public int desire(Deal d, int seat) { return d.mode.misere ? -1 : 1; }

    @Override
    protected void botOther(int seat, int level) {
        if (!"trump".equals(step)) return;
        List<String> opts = new ArrayList<>(modeOptions());
        if (misereAllowed() && level >= 2) for (String k : new ArrayList<>(opts)) opts.add(k + "-m");
        int samples = Bot.samplesFor(level);
        Mode best = null;
        double bestV = -1e9;
        for (String k : opts) {
            Mode m = Mode.parse(k);
            double v = Bot.estimate(this, deal, seat, m, chooser, samples, rng) * multiplier(cfg.mult, m);
            if (level == 0) v += rng.nextGaussian() * 25;
            if (v > bestV) { bestV = v; best = m; }
        }
        double raw = bestV / Math.max(1, multiplier(cfg.mult, best));
        if (schieber && !pushed && raw < 12) {
            act(seat, "push", new LinkedHashMap<String, String>());
            return;
        }
        chooseMode(seat, best);
    }

    // ------------------------------------------------------------------ view

    @Override
    protected void fill(Map<String, Object> gm, List<Integer> mine) {
        super.fill(gm, mine);
        gm.put("live", live);
        gm.put("target", cfg.target);
        gm.put("chooser", chooser);
        gm.put("pushed", pushed);
        gm.put("mult", mult);
        gm.put("manualThanks", cfg.manualThanks);
        if ("trump".equals(step) && mine.contains(actor)) {
            Map<String, Object> pr = new LinkedHashMap<>();
            pr.put("type", "trump");
            pr.put("options", modeOptions());
            pr.put("canPush", schieber && !pushed);
            pr.put("misere", misereAllowed());
            List<Object> mults = new ArrayList<>();
            for (String k : modeOptions()) mults.add(multiplier(cfg.mult, Mode.parse(k)));
            pr.put("mults", mults);
            gm.put("prompt", pr);
        }
        boolean canThank = cfg.manualThanks && !over() && !mine.isEmpty();
        gm.put("canThank", canThank);
    }
}
