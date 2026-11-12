package app.jass.core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/**
 * Card ids: suit * 9 + rank (0..35); a second deck (Tschau Sepp) uses 36..71.
 * Suits: 0 Schellen (Schaufel), 1 Rosen (Herz), 2 Schilten (Kreuz), 3 Eicheln (Ecke).
 * Ranks: 0=6, 1=7, 2=8, 3=9, 4=10/Banner, 5=Under/Bube, 6=Ober/Dame, 7=König, 8=As.
 */
public final class Cards {
    private Cards() {}

    public static final int R6 = 0, R7 = 1, R8 = 2, R9 = 3, R10 = 4, UNDER = 5, OBER = 6, KOENIG = 7, ASS = 8;

    /** Rank order of a trump suit, low to high: 6 7 8 10 Ober König As Nell(9) Puur(Under). */
    static final int[] TRUMP_STRENGTH = {0, 1, 2, 7, 3, 8, 4, 5, 6};
    static final int[] TRUMP_PTS = {0, 0, 0, 14, 10, 20, 3, 4, 11};
    static final int[] PLAIN_PTS = {0, 0, 0, 0, 10, 2, 3, 4, 11};
    static final int[] OBE_PTS = {0, 0, 8, 0, 10, 2, 3, 4, 11};
    static final int[] UNE_PTS = {11, 0, 8, 0, 10, 2, 3, 4, 0};

    public static int suit(int c) { return (c % 36) / 9; }
    public static int rank(int c) { return c % 9; }
    public static int id(int suit, int rank) { return suit * 9 + rank; }

    public static List<Integer> deck(int decks, Random rng) {
        List<Integer> d = new ArrayList<>();
        for (int i = 0; i < 36 * decks; i++) d.add(i);
        Collections.shuffle(d, rng);
        return d;
    }

    public static int[] toArray(List<Integer> l) {
        int[] a = new int[l.size()];
        for (int i = 0; i < a.length; i++) a[i] = l.get(i);
        return a;
    }

    public static List<Integer> parseList(String s) {
        List<Integer> out = new ArrayList<>();
        if (s == null || s.trim().isEmpty()) return out;
        for (String p : s.split(",")) {
            try { out.add(Integer.parseInt(p.trim())); } catch (NumberFormatException ignored) {}
        }
        return out;
    }
}
