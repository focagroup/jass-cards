package app.jass.desktop;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import app.jass.core.Cards;
import app.jass.core.Config;
import app.jass.core.Deal;
import app.jass.core.Match;
import app.jass.core.Mode;
import app.jass.core.Room;
import app.jass.core.Weis;

/** Rule checks and bot-vs-bot games for every variant and player count. */
public final class SimTest {
    static int fails = 0;

    static void check(boolean ok, String what) {
        if (!ok) { fails++; System.out.println("FAIL: " + what); }
    }

    static int c(int suit, int rank) { return Cards.id(suit, rank); }

    static Deal deal4(Mode m, int[][] hands) {
        Deal d = new Deal(4);
        for (int i = 0; i < 4; i++) for (int x : hands[i]) d.hands[i].add(x);
        d.mode = m;
        d.start(0, hands[0].length);
        return d;
    }

    static void ruleChecks() {
        // card point totals
        for (int s = 0; s < 4; s++) {
            int sum = 5;
            for (int x = 0; x < 36; x++) sum += Mode.trump(s).points(x);
            check(sum == 157, "trump total " + sum);
        }
        for (String k : new String[]{"obe", "une", "slalomObe", "hindersi"}) {
            int sum = 5;
            for (int x = 0; x < 36; x++) sum += Mode.parse(k).points(x);
            check(sum == 157, k + " total " + sum);
        }
        int tutti = 5;
        for (int x = 0; x < 36; x++) tutti += Mode.parse("tutti").points(x);
        check(tutti == 253, "tutti total " + tutti);

        // trump order: Puur beats Nell beats As
        Mode t = Mode.trump(1);
        check(t.beats(c(1, Cards.UNDER), c(1, Cards.R9), 0), "Puur > Nell");
        check(t.beats(c(1, Cards.R9), c(1, Cards.ASS), 0), "Nell > As");
        check(t.beats(c(1, Cards.R6), c(0, Cards.ASS), 0), "trump 6 beats side As");
        check(!t.beats(c(2, Cards.ASS), c(0, Cards.R6), 0), "other suit never beats led suit");
        Mode une = Mode.parse("une");
        check(une.beats(c(0, Cards.R6), c(0, Cards.R7), 0), "Undenufe: 6 > 7");

        // no undertrumping: Rosen trump, Schellen led, someone trumped with the Ober
        Deal d = deal4(Mode.trump(1), new int[][]{
                {c(0, Cards.ASS), c(2, 0)}, {c(1, Cards.OBER), c(2, 1)},
                {c(1, Cards.R6), c(0, Cards.R7)}, {c(1, Cards.R7), c(1, Cards.ASS)}});
        d.play(c(0, Cards.ASS));
        d.play(c(1, Cards.OBER));
        List<Integer> l2 = d.legal(2);
        check(l2.contains(c(0, Cards.R7)) && !l2.contains(c(1, Cards.R6)), "may not undertrump while able to follow: " + l2);
        d.play(c(0, Cards.R7));
        List<Integer> l3 = d.legal(3);
        check(l3.size() == 2, "only trumps left: may undertrump " + l3);

        // void and undertrump forbidden unless only trumps
        d = deal4(Mode.trump(1), new int[][]{
                {c(0, Cards.ASS), c(2, 0)}, {c(1, Cards.OBER), c(2, 1)},
                {c(1, Cards.R6), c(3, Cards.R7)}, {c(1, Cards.R7), c(1, Cards.ASS)}});
        d.play(c(0, Cards.ASS));
        d.play(c(1, Cards.OBER));
        List<Integer> l = d.legal(2);
        check(l.contains(c(3, Cards.R7)) && !l.contains(c(1, Cards.R6)), "void: no undertrump " + l);
        d.undertrumpWhenVoid = true;
        check(d.legal(2).contains(c(1, Cards.R6)), "Differenzler: undertrump when void");

        // Puur need not follow trump
        d = deal4(Mode.trump(1), new int[][]{
                {c(1, Cards.ASS), c(2, 0)}, {c(1, Cards.UNDER), c(2, 1)},
                {c(1, Cards.R6), c(0, 2)}, {c(1, Cards.R7), c(0, 3)}});
        d.play(c(1, Cards.ASS));
        check(d.legal(1).size() == 2, "Puur exception " + d.legal(1));

        // weis
        List<Integer> h = new ArrayList<>(Arrays.asList(c(0, 0), c(0, 1), c(0, 2), c(0, 3), c(1, 5), c(2, 5), c(3, 5), c(0, 5), c(2, 8)));
        List<Weis.Item> w = Weis.find(h);
        check(Weis.sum(w) == 250, "Vierblatt 50 + vier Puure 200 = " + Weis.sum(w));
        List<Integer> h2 = new ArrayList<>();
        for (int r = 0; r < 9; r++) h2.add(c(3, r));
        check(Weis.sum(Weis.find(h2)) == 300, "Neunblatt 300");
    }

    static void sims(String variant, int players, int games, int level) {
        long t0 = System.currentTimeMillis();
        int done = 0, errors = 0;
        long rounds = 0;
        Random rng = new Random(players * 7919L + variant.hashCode());
        for (int g = 0; g < games; g++) {
            Config cfg = new Config();
            cfg.setVariant(variant);
            cfg.players = players;
            if ("differenzler".equals(variant)) cfg.rounds = 4;
            if ("molotow".equals(variant)) cfg.rounds = 4;
            if ("schieber".equals(variant)) { cfg.slalom = g % 2 == 0; cfg.tutti = g % 3 == 0; cfg.misere = g % 2 == 1; cfg.manualThanks = g % 2 == 0; }
            if ("klassisch".equals(variant)) cfg.teams = g % 2 == 0;
            if ("tschausepp".equals(variant)) { cfg.reverse10 = g % 2 == 0; cfg.limit = 100; }
            if ("arschloechle".equals(variant)) { cfg.freePass = g % 2 == 0; cfg.joker = g % 3 != 0; }
            try {
                Match m = Room.simulate(cfg, level, rng, 200000);
                if (m.over()) done++;
                else System.out.println("  not finished: " + variant + " " + players + " step=" + m.step + " actor=" + m.actor);
                rounds += m.round;
            } catch (RuntimeException e) {
                errors++;
                if (errors <= 2) e.printStackTrace();
            }
        }
        check(errors == 0 && done == games, variant + "/" + players + ": " + done + "/" + games + " finished, " + errors + " errors");
        System.out.printf("%-13s %d players, level %d: %d/%d games, %.1f rounds avg, %d ms%n", variant, players, level, done, games,
                rounds / (double) games, System.currentTimeMillis() - t0);
    }

    public static void main(String[] args) {
        ruleChecks();
        System.out.println("rule checks done, fails so far: " + fails);
        for (String v : Config.VARIANTS) {
            for (int p = Config.minPlayers(v); p <= Config.maxPlayers(v); p++) {
                sims(v, p, "tschausepp".equals(v) || "arschloechle".equals(v) ? 40 : 6, 1);
            }
        }
        sims("schieber", 4, 2, 2);
        sims("differenzler", 4, 1, 2);
        sims("bieter", 3, 1, 2);
        sims("molotow", 4, 1, 0);
        sims("ohshit", 4, 1, 2);
        System.out.println(fails == 0 ? "ALL OK" : fails + " FAILURES");
        System.exit(fails == 0 ? 0 : 1);
    }
}
