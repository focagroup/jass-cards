package app.jass.core;

import java.util.ArrayList;
import java.util.List;

/**
 * The trick-taking part of one deal: hands, the current trick, who won what.
 * Used by every trick game and copied by the bots for simulations.
 */
public final class Deal {
    public final int n;
    public final List<Integer>[] hands;
    public Mode mode;
    public final int[] trickCards, trickSeats;
    public int trickSize;
    public int leader, turn, trickNo, totalTricks;
    /** Card points (incl. 5 for the last trick) and tricks won per seat. */
    public final int[] points, tricks;
    /** Cards won per seat (needed when card values change late, e.g. Molotow). */
    public final List<Integer>[] won;
    public final boolean[] played = new boolean[36];
    /** voids[seat][suit]: seat showed it has no card of that suit. */
    public final boolean[][] voids;

    public boolean undertrumpWhenVoid, undertrumpAlways, molotow;
    public int molotowSetter = -1;

    public int lastWinner = -1, lastTrickPoints;
    public int[] lastTrickCards = new int[0], lastTrickSeats = new int[0];

    @SuppressWarnings("unchecked")
    public Deal(int n) {
        this.n = n;
        hands = new List[n];
        won = new List[n];
        for (int i = 0; i < n; i++) { hands[i] = new ArrayList<>(); won[i] = new ArrayList<>(); }
        trickCards = new int[n];
        trickSeats = new int[n];
        points = new int[n];
        tricks = new int[n];
        voids = new boolean[n][4];
    }

    public Deal copy() {
        Deal d = new Deal(n);
        for (int i = 0; i < n; i++) { d.hands[i].addAll(hands[i]); d.won[i].addAll(won[i]); }
        d.mode = mode == null ? null : mode.copy();
        System.arraycopy(trickCards, 0, d.trickCards, 0, n);
        System.arraycopy(trickSeats, 0, d.trickSeats, 0, n);
        d.trickSize = trickSize;
        d.leader = leader; d.turn = turn; d.trickNo = trickNo; d.totalTricks = totalTricks;
        System.arraycopy(points, 0, d.points, 0, n);
        System.arraycopy(tricks, 0, d.tricks, 0, n);
        System.arraycopy(played, 0, d.played, 0, 36);
        for (int i = 0; i < n; i++) System.arraycopy(voids[i], 0, d.voids[i], 0, 4);
        d.undertrumpWhenVoid = undertrumpWhenVoid; d.undertrumpAlways = undertrumpAlways; d.molotow = molotow;
        d.molotowSetter = molotowSetter;
        d.lastWinner = lastWinner; d.lastTrickPoints = lastTrickPoints;
        d.lastTrickCards = lastTrickCards.clone(); d.lastTrickSeats = lastTrickSeats.clone();
        return d;
    }

    public void start(int leader, int totalTricks) {
        this.leader = leader;
        this.turn = leader;
        this.totalTricks = totalTricks;
    }

    public boolean done() { return trickNo >= totalTricks; }

    public int ledSuit() { return trickSize == 0 ? -1 : Cards.suit(trickCards[0]); }

    /** Legal cards for the seat on turn. */
    public List<Integer> legal(int seat) {
        List<Integer> hand = hands[seat];
        if (trickSize == 0) return new ArrayList<>(hand);
        int led = ledSuit();
        int t = mode.type == Mode.TUTTI ? -1 : mode.trumpSuit();
        List<Integer> out = new ArrayList<>();
        boolean haveLed = false;
        for (int c : hand) if (Cards.suit(c) == led) { haveLed = true; break; }
        if (t < 0) {
            for (int c : hand) if (Cards.suit(c) == led) out.add(c);
            return haveLed ? out : new ArrayList<>(hand);
        }
        if (led == t) {
            boolean other = false;
            for (int c : hand) if (Cards.suit(c) == t && Cards.rank(c) != Cards.UNDER) other = true;
            if (!other) return new ArrayList<>(hand); // the Puur need not follow
            for (int c : hand) if (Cards.suit(c) == t) out.add(c);
            return out;
        }
        int highest = -1;
        for (int i = 0; i < trickSize; i++)
            if (Cards.suit(trickCards[i]) == t) highest = Math.max(highest, Cards.TRUMP_STRENGTH[Cards.rank(trickCards[i])]);
        boolean allTrump = true;
        for (int c : hand) if (Cards.suit(c) != t) { allTrump = false; break; }
        if (!haveLed && allTrump) return new ArrayList<>(hand);
        boolean under = undertrumpAlways || (undertrumpWhenVoid && !haveLed);
        for (int c : hand) {
            int s = Cards.suit(c);
            if (s == led) out.add(c);
            else if (s == t) { if (highest < 0 || under || Cards.TRUMP_STRENGTH[Cards.rank(c)] > highest) out.add(c); }
            else if (!haveLed) out.add(c);
        }
        if (out.isEmpty()) return new ArrayList<>(hand);
        return out;
    }

    public boolean isLegal(int seat, int card) { return legal(seat).contains(card); }

    /** Index (within the trick) of the card currently winning. */
    public int winnerIndex() {
        int best = 0;
        for (int i = 1; i < trickSize; i++) if (mode.beats(trickCards[i], trickCards[best], trickNo)) best = i;
        return best;
    }

    public int winnerSeat() { return trickSeats[winnerIndex()]; }

    /** Would this card take the lead if played now by the seat on turn? */
    public boolean wouldWin(int card) {
        if (trickSize == 0) return true;
        return mode.beats(card, trickCards[winnerIndex()], trickNo);
    }

    /** Plays a card for the seat on turn. Returns true if this completed a trick. */
    public boolean play(int card) {
        int seat = turn;
        hands[seat].remove(Integer.valueOf(card));
        int s = Cards.suit(card);
        if (trickSize > 0) {
            int led = ledSuit();
            if (s != led) {
                voids[seat][led] = true;
                if (molotow && mode.suit < 0) { mode.suit = s; molotowSetter = seat; }
            }
        }
        played[card % 36] = true;
        trickCards[trickSize] = card;
        trickSeats[trickSize] = seat;
        trickSize++;
        if (trickSize < n) { turn = (turn + 1) % n; return false; }
        int w = winnerSeat();
        int pts = 0;
        for (int i = 0; i < n; i++) { pts += mode.points(trickCards[i]); won[w].add(trickCards[i]); }
        if (trickNo == totalTricks - 1) pts += 5;
        points[w] += pts;
        tricks[w]++;
        lastWinner = w;
        lastTrickPoints = pts;
        lastTrickCards = java.util.Arrays.copyOf(trickCards, n);
        lastTrickSeats = java.util.Arrays.copyOf(trickSeats, n);
        trickSize = 0;
        trickNo++;
        leader = turn = w;
        return true;
    }

    /** Card points of each seat counted with the (final) mode, for games where values change late. */
    public int[] recount() {
        int[] p = new int[n];
        for (int i = 0; i < n; i++) for (int c : won[i]) p[i] += mode.points(c);
        if (lastWinner >= 0 && done()) p[lastWinner] += 5;
        return p;
    }
}
