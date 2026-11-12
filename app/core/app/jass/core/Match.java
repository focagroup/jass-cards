package app.jass.core;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

/** A running game of any variant. The Room drives it; all calls happen under the Room lock. */
public abstract class Match {
    public static final String ROUND_END = "roundEnd", OVER = "gameOver", PLAY = "play";

    public final Config cfg;
    protected final Random rng;
    public final int n;
    /** Current step: play, trump, bid, discard, callCard, announce, decline, roundEnd, gameOver. */
    public String step = PLAY;
    /** Seat that must act now (-1: nobody, e.g. waiting for "next round"). */
    public int actor = -1;
    public int round = 0;
    public int dealer;
    /** Running totals per team (or per player). */
    public long[] totals;
    /** Teams (or players) that won the game. */
    public final List<Integer> winners = new ArrayList<>();
    /** Extra pause before a bot acts (e.g. after a completed trick) in ms. */
    public int delayHint;
    /** Round summary for the result sheet. */
    protected Map<String, Object> result;

    private final List<Map<String, Object>> events = new ArrayList<>();
    private int eventSeq;

    protected Match(Config cfg, Random rng) {
        this.cfg = cfg;
        this.rng = rng;
        this.n = cfg.players;
    }

    public static Match create(Config cfg, Random rng) {
        switch (cfg.variant) {
            case "klassisch": case "schieber": return new TeamJass(cfg, rng);
            case "bieter": return new Bieter(cfg, rng);
            case "differenzler": return new Differenzler(cfg, rng);
            case "molotow": return new Molotow(cfg, rng);
            case "ohshit": return new OhShit(cfg, rng);
            case "tschausepp": return new TschauSepp(cfg, rng);
            case "arschloechle": return new Arschloechle(cfg, rng);
            default: throw new IllegalArgumentException(cfg.variant);
        }
    }

    public abstract int teams();
    public abstract int team(int seat);

    public boolean over() { return OVER.equals(step); }
    public boolean roundOver() { return ROUND_END.equals(step); }

    /** A player action. Returns an error key or null. */
    public abstract String act(int seat, String action, Map<String, String> p);

    /** Let a bot act for the seat that is on turn. */
    public abstract void bot(int seat, int level);

    /** Out-of-turn bot actions (e.g. Bedanken). Returns true if something changed. */
    public boolean botExtra(Set<Integer> botSeats) { return false; }

    public abstract void nextRound();

    protected abstract void fill(Map<String, Object> gm, List<Integer> mine);

    protected void event(String type, Object... kv) {
        Map<String, Object> e = new LinkedHashMap<>();
        e.put("seq", ++eventSeq);
        e.put("type", type);
        for (int i = 0; i + 1 < kv.length; i += 2) e.put(String.valueOf(kv[i]), kv[i + 1]);
        events.add(e);
        if (events.size() > 24) events.remove(0);
    }

    protected void finishGame(List<Integer> w) {
        winners.clear();
        winners.addAll(w);
        step = OVER;
        actor = -1;
    }

    public Map<String, Object> view(List<Integer> mine) {
        Map<String, Object> gm = new LinkedHashMap<>();
        gm.put("variant", cfg.variant);
        gm.put("step", step);
        gm.put("actor", actor);
        gm.put("round", round);
        gm.put("dealer", dealer);
        gm.put("teams", teams());
        List<Object> to = new ArrayList<>();
        for (int i = 0; i < n; i++) to.add(team(i));
        gm.put("teamOf", to);
        gm.put("totals", totals);
        gm.put("winners", winners);
        gm.put("events", events);
        if ((roundOver() || over()) && result != null) gm.put("result", result);
        fill(gm, mine);
        return gm;
    }

    // ------------------------------------------------------------------ result sheet helpers

    protected Map<String, Object> newResult() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("rows", new ArrayList<Object>());
        return r;
    }

    @SuppressWarnings("unchecked")
    protected void row(Map<String, Object> r, String label, Object values, String cls) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("label", label);
        m.put("values", values);
        if (cls != null) m.put("cls", cls);
        ((List<Object>) r.get("rows")).add(m);
    }

    protected static List<Object> list(long[] a) {
        List<Object> l = new ArrayList<>();
        for (long x : a) l.add(x);
        return l;
    }

    protected static List<Object> list(int[] a) {
        List<Object> l = new ArrayList<>();
        for (int x : a) l.add(x);
        return l;
    }

    static int parse(Map<String, String> p, String k, int def) { return Room.parseInt(p.get(k), def); }
}
