package app.jass.core;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

/**
 * A single game room: lobby configuration, seats, the running match and the bot driver.
 * All public methods are synchronized; state changes bump `version` and wake long-polls.
 */
public final class Room {
    public static final int LOCAL = 0, REMOTE = 1, BOT = 2;
    public static final int MAX_SEATS = 8;
    private static final String[] TYPE_NAMES = {"local", "remote", "bot"};
    private static final long BOT_DELAY_MS = 850;
    private static final long ONLINE_MS = 45000;

    public static final class Seat {
        int type;
        String name = "";
        String token;
        int botLevel = 1;
        long lastSeen;
    }

    private final Random rng = new Random();
    private final Config cfg = new Config();
    private final Seat[] seats = new Seat[MAX_SEATS];
    private Match match;
    private long version = 1;
    private long lastChange = System.currentTimeMillis();
    private int gameId = 0;

    public Room() {
        for (int i = 0; i < MAX_SEATS; i++) {
            seats[i] = new Seat();
            seats[i].type = i == 0 ? LOCAL : BOT;
        }
        Thread t = new Thread(new Runnable() {
            @Override public void run() { botLoop(); }
        }, "jass-bots");
        t.setDaemon(true);
        t.start();
    }

    private void changed() {
        version++;
        lastChange = System.currentTimeMillis();
        notifyAll();
    }

    public synchronized void awaitChange(long since, long timeoutMs) {
        long end = System.currentTimeMillis() + timeoutMs;
        while (version <= since) {
            long left = end - System.currentTimeMillis();
            if (left <= 0) return;
            try { wait(left); } catch (InterruptedException e) { return; }
        }
    }

    // ------------------------------------------------------------------ bots

    private Set<Integer> botSeats() {
        Set<Integer> b = new HashSet<>();
        if (match == null) return b;
        for (int i = 0; i < match.n; i++) if (seats[i].type == BOT) b.add(i);
        return b;
    }

    private void botLoop() {
        while (true) {
            synchronized (this) {
                try {
                    Match m = match;
                    if (m != null && !m.over() && m.botExtra(botSeats())) {
                        changed();
                        continue;
                    }
                    if (m != null && !m.over() && !m.roundOver() && m.actor >= 0 && seats[m.actor].type == BOT) {
                        long due = lastChange + BOT_DELAY_MS + m.delayHint;
                        long now = System.currentTimeMillis();
                        if (now >= due) {
                            int s = m.actor;
                            m.bot(s, seats[s].botLevel);
                            changed();
                        } else {
                            wait(due - now);
                        }
                    } else {
                        wait(5000);
                    }
                } catch (InterruptedException e) {
                    return;
                } catch (RuntimeException e) {
                    e.printStackTrace();
                    try { wait(1000); } catch (InterruptedException ie) { return; }
                }
            }
        }
    }

    // ------------------------------------------------------------------ access control

    private int players() { return match != null ? match.n : cfg.players; }

    private boolean controls(int seat, String token, boolean isHost) {
        if (seat < 0 || seat >= players()) return false;
        Seat s = seats[seat];
        if (s.type == LOCAL) return isHost;
        if (s.type == REMOTE) return token != null && token.equals(s.token);
        return false;
    }

    private void touch(String token) {
        if (token == null) return;
        long now = System.currentTimeMillis();
        for (Seat s : seats) {
            if (s.type == REMOTE && token.equals(s.token)) {
                boolean wasOffline = now - s.lastSeen > ONLINE_MS;
                s.lastSeen = now;
                if (wasOffline) changed();
            }
        }
    }

    // ------------------------------------------------------------------ lobby actions

    public synchronized String configure(boolean isHost, Map<String, String> p) {
        if (!isHost) return "host_only";
        if (match != null) return "game_running";
        cfg.apply(p);
        for (int i = 0; i < MAX_SEATS; i++) {
            Seat s = seats[i];
            String type = p.get("seat" + i + "_type");
            if (type != null) {
                int nt = indexOf(TYPE_NAMES, type);
                if (nt >= 0 && nt != s.type) {
                    s.type = nt;
                    s.token = null;
                    s.name = "";
                }
            }
            String name = p.get("seat" + i + "_name");
            if (name != null && s.type != REMOTE) s.name = cleanName(name);
            String lvl = p.get("seat" + i + "_bot");
            if (lvl != null) s.botLevel = Config.clamp(parseInt(lvl, 1), 0, 2);
        }
        changed();
        return null;
    }

    public synchronized String join(String token, int seat, String name) {
        if (token == null || token.length() < 8) return "bad_token";
        if (match != null) return "game_running";
        if (seat < 0 || seat >= cfg.players) return "bad_seat";
        Seat s = seats[seat];
        if (s.type != REMOTE) return "bad_seat";
        if (s.token != null && !s.token.equals(token)) return "seat_taken";
        for (Seat o : seats) if (o != s && token.equals(o.token)) { o.token = null; o.name = ""; }
        s.token = token;
        s.name = cleanName(name);
        s.lastSeen = System.currentTimeMillis();
        changed();
        return null;
    }

    public synchronized String leave(String token) {
        if (token == null) return null;
        for (Seat s : seats) if (token.equals(s.token) && match == null) { s.token = null; s.name = ""; }
        changed();
        return null;
    }

    public synchronized String start(boolean isHost) {
        if (!isHost) return "host_only";
        if (match != null) return "game_running";
        for (int i = 0; i < cfg.players; i++)
            if (seats[i].type == REMOTE && seats[i].token == null) return "seats_open";
        match = Match.create(cfg.copy(), rng);
        gameId++;
        changed();
        return null;
    }

    public synchronized String nextRound(boolean isHost) {
        if (!isHost) return "host_only";
        if (match == null) return "no_game";
        match.nextRound();
        changed();
        return null;
    }

    public synchronized String endGame(boolean isHost) {
        if (!isHost) return "host_only";
        match = null;
        changed();
        return null;
    }

    public synchronized String setSeatType(boolean isHost, int seat, String type) {
        if (!isHost) return "host_only";
        if (seat < 0 || seat >= players()) return "bad_seat";
        int nt = indexOf(TYPE_NAMES, type);
        if (nt < 0 || nt == REMOTE) return "bad_type";
        seats[seat].type = nt;
        seats[seat].token = null;
        changed();
        return null;
    }

    public synchronized String act(String token, boolean isHost, int seat, String action, Map<String, String> p) {
        if (match == null) return "no_game";
        if (!controls(seat, token, isHost)) return "not_your_seat";
        String err;
        try {
            err = match.act(seat, action == null ? "" : action, p);
        } catch (RuntimeException e) {
            e.printStackTrace();
            err = "internal";
        }
        if (err == null) changed();
        return err;
    }

    // ------------------------------------------------------------------ state view

    public synchronized String state(String token, boolean isHost, List<String> addresses, int port) {
        touch(token);
        long now = System.currentTimeMillis();
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("v", version);
        o.put("isHost", isHost);
        o.put("gameId", gameId);

        List<Integer> mine = new ArrayList<>();
        for (int i = 0; i < players(); i++) if (controls(i, token, isHost)) mine.add(i);
        o.put("mySeats", mine);
        o.put("config", (match != null ? match.cfg : cfg).toMap());

        List<Object> seatList = new ArrayList<>();
        for (int i = 0; i < MAX_SEATS; i++) {
            Seat s = seats[i];
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("type", TYPE_NAMES[s.type]);
            m.put("name", s.name);
            m.put("bot", s.botLevel);
            m.put("taken", s.type != REMOTE || s.token != null);
            m.put("online", s.type != REMOTE || (s.token != null && now - s.lastSeen < ONLINE_MS));
            m.put("you", token != null && token.equals(s.token));
            seatList.add(m);
        }
        o.put("seats", seatList);
        if (isHost) {
            o.put("addresses", addresses);
            o.put("port", port);
        }
        if (match == null) {
            o.put("phase", "lobby");
            return Json.write(o);
        }
        o.put("phase", match.over() ? "gameOver" : match.roundOver() ? "roundEnd" : "playing");
        o.put("game", match.view(mine));
        return Json.write(o);
    }

    // ------------------------------------------------------------------ helpers

    private static String cleanName(String s) {
        if (s == null) return "";
        StringBuilder b = new StringBuilder();
        for (int i = 0; i < s.length() && b.length() < 16; i++) {
            char ch = s.charAt(i);
            if (ch >= 0x20 && ch != '<' && ch != '>') b.append(ch);
        }
        return b.toString().trim();
    }

    private static int indexOf(String[] a, String s) {
        for (int i = 0; i < a.length; i++) if (a[i].equals(s)) return i;
        return -1;
    }

    public static int parseInt(String s, int def) {
        try { return Integer.parseInt(s.trim()); } catch (Exception e) { return def; }
    }

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
