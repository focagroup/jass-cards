package app.jass.core;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Weis (Wyys): runs of three or more in one suit and four of a kind. */
public final class Weis {
    private Weis() {}

    public static final class Item {
        public final boolean four;   // four of a kind, else a run
        public final int len;        // run length (4 for four of a kind)
        public final int top;        // highest rank of the run / the rank of the four
        public final int low;        // lowest rank of the run
        public final int suit;       // run suit, -1 for four of a kind
        public final int points;
        public final int[] cards;

        Item(boolean four, int len, int top, int low, int suit, int points, int[] cards) {
            this.four = four; this.len = len; this.top = top; this.low = low; this.suit = suit;
            this.points = points; this.cards = cards;
        }

        public Map<String, Object> toMap() {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("four", four);
            m.put("len", len);
            m.put("top", top);
            m.put("suit", suit);
            m.put("pts", points);
            m.put("cards", cards);
            return m;
        }
    }

    static final int[] RUN_PTS = {0, 0, 0, 20, 50, 100, 150, 200, 250, 300};

    public static int fourPoints(int rank) {
        if (rank == Cards.UNDER) return 200;
        if (rank == Cards.R9) return 150;
        if (rank >= Cards.R10) return 100;
        return 0;
    }

    /** All Weis in a set of cards (maximal runs per suit, plus four of a kind). */
    public static List<Item> find(List<Integer> cards) {
        boolean[][] has = new boolean[4][9];
        for (int c : cards) has[Cards.suit(c)][Cards.rank(c)] = true;
        List<Item> out = new ArrayList<>();
        for (int s = 0; s < 4; s++) {
            int r = 0;
            while (r < 9) {
                if (!has[s][r]) { r++; continue; }
                int start = r;
                while (r < 9 && has[s][r]) r++;
                int len = r - start;
                if (len >= 3) {
                    int[] cs = new int[len];
                    for (int k = 0; k < len; k++) cs[k] = Cards.id(s, start + k);
                    out.add(new Item(false, len, r - 1, start, s, RUN_PTS[len], cs));
                }
            }
        }
        for (int rk = Cards.R9; rk <= Cards.ASS; rk++) {
            if (fourPoints(rk) == 0) continue;
            if (has[0][rk] && has[1][rk] && has[2][rk] && has[3][rk])
                out.add(new Item(true, 4, rk, rk, -1, fourPoints(rk), new int[]{Cards.id(0, rk), Cards.id(1, rk), Cards.id(2, rk), Cards.id(3, rk)}));
        }
        return out;
    }

    public static int sum(List<Item> items) {
        int s = 0;
        for (Item i : items) s += i.points;
        return s;
    }

    /**
     * Compares two Weis: more points wins; then four of a kind over a run; then the longer run;
     * then the higher top card (in Undenufe the lower one); then a run in the trump suit.
     * Returns >0 if a is better. Equal Weis are decided by seat order by the caller.
     */
    public static int compare(Item a, Item b, Mode mode) {
        if (a.points != b.points) return a.points - b.points;
        if (a.four != b.four) return a.four ? 1 : -1;
        if (a.len != b.len) return a.len - b.len;
        boolean une = mode != null && !mode.obeAt(0);
        int ta = une ? 8 - a.low : a.top, tb = une ? 8 - b.low : b.top;
        if (ta != tb) return ta - tb;
        int t = mode == null ? -1 : mode.trumpSuit();
        boolean at = t >= 0 && a.suit == t, bt = t >= 0 && b.suit == t;
        if (at != bt) return at ? 1 : -1;
        return 0;
    }

    public static Item best(List<Item> items, Mode mode) {
        Item b = null;
        for (Item i : items) if (b == null || compare(i, b, mode) > 0) b = i;
        return b;
    }
}
