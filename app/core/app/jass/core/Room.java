package app.jass.core;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import app.cards.core.GameInfo;

/**
 * The Jass room: lobby settings, the running {@link Match} (any variant) and its view.
 * Seats, joining, long polling and the bot loop come from the framework's Room.
 */
public final class Room extends app.cards.core.Room {
    public static final GameInfo INFO = new GameInfo("jass", "Jass", "Jass");
    public static final int MAX_SEATS = 8;
    private static final long BOT_DELAY_MS = 850;

    private final Config cfg = new Config();
    private Match match;

    public Room() {
        super(INFO, MAX_SEATS, BOT_DELAY_MS);
    }

    // ------------------------------------------------------------------ lifecycle

    @Override protected boolean hasGame() { return match != null; }

    @Override protected int players() { return match != null ? match.n : cfg.players; }

    @Override protected void configureGame(Map<String, String> p) { cfg.apply(p); }

    @Override protected void newGame() { match = Match.create(cfg.copy(), rng); }

    @Override protected void nextGameRound() { match.nextRound(); }

    @Override protected void clearGame() { match = null; }

    // ------------------------------------------------------------------ moves and bots

    @Override public boolean handles(String action) { return "act".equals(action); }

    /** "act": action=&lt;play|trump|bid|...&gt; plus that action's parameters. */
    @Override protected String play(int seat, String apiAction, Map<String, String> p) {
        String action = p.get("action");
        try {
            return match.act(seat, action == null ? "" : action, p);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return "internal";
        }
    }

    private Set<Integer> botSeats() {
        Set<Integer> b = new HashSet<>();
        if (match == null) return b;
        for (int i = 0; i < match.n; i++) if (seats[i].type == BOT) b.add(i);
        return b;
    }

    @Override protected boolean botExtra() { return !match.over() && match.botExtra(botSeats()); }

    @Override protected int botTurn() {
        return !match.over() && !match.roundOver() && match.actor >= 0 ? match.actor : -1;
    }

    @Override protected long botDelayHint() { return match.delayHint; }

    @Override protected void botPlay(int s, int level) { match.bot(s, level); }

    @Override protected long botErrorPauseMs() { return 1000; }

    // ------------------------------------------------------------------ state view

    @Override protected Object configView() { return (match != null ? match.cfg : cfg).toMap(); }

    @Override protected String phase() {
        return match.over() ? "gameOver" : match.roundOver() ? "roundEnd" : "playing";
    }

    @Override protected Map<String, Object> gameView(List<Integer> mine) { return match.view(mine); }

    // ------------------------------------------------------------------ tests

    /** For tests: run a match synchronously with bots only. */
    public static Match simulate(Config cfg, int level, Random rng, int maxSteps) {
        Match m = Match.create(cfg, rng);
        Set<Integer> all = new HashSet<>();
        for (int i = 0; i < cfg.players; i++) all.add(i);
        int stepsDone = 0;
        while (!m.over() && stepsDone++ < maxSteps) {
            if (m.botExtra(all)) continue;
            if (m.roundOver()) { m.nextRound(); continue; }
            if (m.actor < 0) break;
            m.bot(m.actor, level);
        }
        return m;
    }
}
