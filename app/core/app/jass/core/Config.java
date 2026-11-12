package app.jass.core;

import java.util.LinkedHashMap;
import java.util.Map;

/** Lobby settings. Each variant uses only the options that apply to it. */
public final class Config {
    public static final String[] VARIANTS = {"klassisch", "schieber", "bieter", "differenzler", "molotow", "tschausepp", "ohshit", "arschloechle"};

    public String variant = "schieber";
    public int players = 4;
    /** Klassisch: 4 players in two teams (else everybody alone). */
    public boolean teams = true;
    /** Klassisch / Schieber: points to win. */
    public int target = 2500;
    /** Klassisch / Schieber: winning needs a tap on "Bedanken" (else automatic). */
    public boolean manualThanks = true;
    /** Multipliers: simple | double | double4 | appenzell. */
    public String mult = "double";
    /** Schieber extra modes. */
    public boolean slalom, tutti, misere;
    /** Differenzler: hidden announcements. */
    public boolean hidden;
    /** Differenzler / Molotow: number of deals. */
    public int rounds = 16;
    /** Oh Shit: 10 bonus points for an exact prediction. */
    public boolean bonus = true;
    /** Tschau Sepp: a 10 reverses the direction; penalty point limit. */
    public boolean reverse10;
    public int limit = 200;
    /** Arschlöchle: passing allowed even if you could beat; Rosen-6 is a Joker. */
    public boolean freePass, joker = true;

    public static int minPlayers(String v) {
        switch (v) {
            case "tschausepp": return 2;
            case "schieber": case "ohshit": return 4;
            default: return 3;
        }
    }

    public static int maxPlayers(String v) {
        switch (v) {
            case "bieter": return 5;
            case "molotow": return 6;
            case "tschausepp": return 8;
            case "arschloechle": return 6;
            default: return 4;
        }
    }

    public boolean teamPlay() {
        return "schieber".equals(variant) || ("klassisch".equals(variant) && teams && players == 4);
    }

    /** Switch variant and reset the options to that variant's usual defaults. */
    public void setVariant(String v) {
        boolean ok = false;
        for (String x : VARIANTS) if (x.equals(v)) ok = true;
        if (!ok) return;
        variant = v;
        players = Math.max(minPlayers(v), Math.min(maxPlayers(v), players));
        if ("schieber".equals(v)) { target = 2500; mult = "double"; manualThanks = true; }
        if ("klassisch".equals(v)) { target = 1000; mult = "simple"; manualThanks = true; }
        if ("differenzler".equals(v)) rounds = 16;
        if ("molotow".equals(v)) rounds = 8;
        if ("tschausepp".equals(v)) limit = 200;
        if ("arschloechle".equals(v)) rounds = 10;
        if ("bieter".equals(v) && players == 4) players = 3;
    }

    public Config copy() {
        Config c = new Config();
        c.variant = variant; c.players = players; c.teams = teams; c.target = target; c.manualThanks = manualThanks;
        c.mult = mult; c.slalom = slalom; c.tutti = tutti; c.misere = misere; c.hidden = hidden; c.rounds = rounds;
        c.bonus = bonus; c.reverse10 = reverse10; c.limit = limit;
        c.freePass = freePass; c.joker = joker;
        return c;
    }

    public Map<String, Object> toMap() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("variant", variant);
        m.put("players", players);
        m.put("teams", teams);
        m.put("teamPlay", teamPlay());
        m.put("target", target);
        m.put("manualThanks", manualThanks);
        m.put("mult", mult);
        m.put("slalom", slalom);
        m.put("tutti", tutti);
        m.put("misere", misere);
        m.put("hidden", hidden);
        m.put("rounds", rounds);
        m.put("bonus", bonus);
        m.put("reverse10", reverse10);
        m.put("limit", limit);
        m.put("freePass", freePass);
        m.put("joker", joker);
        m.put("minPlayers", minPlayers(variant));
        m.put("maxPlayers", maxPlayers(variant));
        return m;
    }

    private static boolean bool(String s) { return "1".equals(s) || "true".equals(s); }

    public void apply(Map<String, String> p) {
        if (p.containsKey("variant")) setVariant(p.get("variant"));
        if (p.containsKey("players")) players = clamp(Room.parseInt(p.get("players"), players), minPlayers(variant), maxPlayers(variant));
        if (p.containsKey("teams")) teams = bool(p.get("teams"));
        if (p.containsKey("target")) target = clamp(Room.parseInt(p.get("target"), target), 100, 10000);
        if (p.containsKey("manualThanks")) manualThanks = bool(p.get("manualThanks"));
        if (p.containsKey("mult")) {
            String m = p.get("mult");
            if ("simple".equals(m) || "double".equals(m) || "double4".equals(m) || "appenzell".equals(m)) {
                mult = m;
                if ("appenzell".equals(m)) target = 5000;
            }
        }
        if (p.containsKey("slalom")) slalom = bool(p.get("slalom"));
        if (p.containsKey("tutti")) tutti = bool(p.get("tutti"));
        if (p.containsKey("misere")) misere = bool(p.get("misere"));
        if (p.containsKey("hidden")) hidden = bool(p.get("hidden"));
        if (p.containsKey("rounds")) rounds = clamp(Room.parseInt(p.get("rounds"), rounds), 1, 40);
        if (p.containsKey("bonus")) bonus = bool(p.get("bonus"));
        if (p.containsKey("reverse10")) reverse10 = bool(p.get("reverse10"));
        if (p.containsKey("freePass")) freePass = bool(p.get("freePass"));
        if (p.containsKey("joker")) joker = bool(p.get("joker"));
        if (p.containsKey("limit")) limit = clamp(Room.parseInt(p.get("limit"), limit), 50, 1000);
    }

    static int clamp(int v, int lo, int hi) { return Math.max(lo, Math.min(hi, v)); }
}
