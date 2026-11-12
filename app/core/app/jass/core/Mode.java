package app.jass.core;

/** The way a deal is played: trump suit, Obenabe, Undenufe and the special forms. */
public final class Mode {
    public static final int TRUMP = 0, OBE = 1, UNE = 2, SLALOM_OBE = 3, SLALOM_UNE = 4, TUTTI = 5, HINDERSI = 6, MOLOTOW = 7;
    private static final String[] NAMES = {"trump", "obe", "une", "slalomObe", "slalomUne", "tutti", "hindersi", "molotow"};

    public final int type;
    /** Trump suit for TRUMP; for MOLOTOW -1 until the first player who cannot follow sets it. */
    public int suit;
    public boolean misere;

    public Mode(int type, int suit) { this.type = type; this.suit = suit; }

    public static Mode trump(int s) { return new Mode(TRUMP, s); }

    public Mode copy() { Mode m = new Mode(type, suit); m.misere = misere; return m; }

    public int trumpSuit() { return type == TRUMP || type == MOLOTOW ? suit : -1; }

    public boolean obeAt(int trickNo) {
        switch (type) {
            case UNE: return false;
            case SLALOM_OBE: return trickNo % 2 == 0;
            case SLALOM_UNE: return trickNo % 2 == 1;
            default: return true;
        }
    }

    public int points(int c) {
        int r = Cards.rank(c);
        switch (type) {
            case TRUMP:
            case MOLOTOW:
                if (suit < 0) return Cards.OBE_PTS[r];
                return Cards.suit(c) == suit ? Cards.TRUMP_PTS[r] : Cards.PLAIN_PTS[r];
            case UNE:
            case SLALOM_UNE:
                return Cards.UNE_PTS[r];
            case TUTTI:
                return Cards.TRUMP_PTS[r];
            default:
                return Cards.OBE_PTS[r];
        }
    }

    /** Points of all cards plus the last trick (no Matsch bonus). */
    public int total() { return type == TUTTI ? 253 : 157; }

    /** Strength of a card for winning a trick; only comparable within one suit (or trump vs. not). */
    public int strength(int c, int trickNo) {
        int r = Cards.rank(c);
        if (type == TUTTI) return Cards.TRUMP_STRENGTH[r];
        if (trumpSuit() >= 0 && Cards.suit(c) == suit) return 100 + Cards.TRUMP_STRENGTH[r];
        return obeAt(trickNo) ? r : 8 - r;
    }

    /** Does card a beat the currently best card b of the trick? */
    public boolean beats(int a, int b, int trickNo) {
        if (Cards.suit(a) == Cards.suit(b)) return strength(a, trickNo) > strength(b, trickNo);
        int t = trumpSuit();
        return t >= 0 && Cards.suit(a) == t;
    }

    public String key() {
        String k = type == TRUMP ? "trump" + suit : NAMES[type];
        return misere ? k + "-m" : k;
    }

    public static Mode parse(String key) {
        if (key == null) return null;
        boolean mis = key.endsWith("-m");
        if (mis) key = key.substring(0, key.length() - 2);
        Mode m = null;
        if (key.startsWith("trump") && key.length() == 6) {
            int s = key.charAt(5) - '0';
            if (s >= 0 && s < 4) m = trump(s);
        } else {
            for (int i = 1; i < NAMES.length; i++) if (NAMES[i].equals(key)) m = new Mode(i, -1);
        }
        if (m != null) m.misere = mis;
        return m;
    }
}
